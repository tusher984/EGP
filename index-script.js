
        const CONFIG = {
            GITHUB_USER: 'tusher984',
            GITHUB_REPO: 'EGP',
            FILE_PATH: 'Procurement_Database.json',
            PDF_FOLDERS: ['Contract_Awards_PDFs', 'Tender Notice_PDFs'],
            API_URL: () => `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.FILE_PATH}`,
            LOCAL_PDF_URLS: (file) => CONFIG.PDF_FOLDERS.map(folder => `./${encodeURIComponent(folder)}/${encodeURIComponent(file)}`),
            REMOTE_PDF_URLS: (file) => CONFIG.PDF_FOLDERS.map(folder => `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/main/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`)
        };

        const RULES = [
            { id: 'owner', title: 'ITT 5.14 Hidden Ownership', desc: 'Owner details are obscured or anonymised to conceal final beneficiaries.' },
            { id: 'split', title: 'PPA 2006 Split Contracts', desc: 'Large scope contracts are artificially divided to avoid oversight thresholds.' },
            { id: 'cpv', title: 'CPV Manipulation', desc: 'CPV classifications are intentionally wrong to hide the true nature of contracts.' },
            { id: 'tailored', title: 'Tailored Conditions', desc: 'Bid conditions appear to favour a single contractor or supplier.' }
        ];

        const State = {
            data: [],
            filtered: [],
            originalJson: null,
            jsonArray: [],
            activeId: null,
            pdfDoc: null,
            currentPdfPage: 1,
            totalPdfPages: 0,
            chart: null,
            autoSaveTimer: null,
            sessionToken: null,
            activeRule: null,
            activePdfFile: ''
        };

        const DOM = {
            ledgerBody: document.getElementById('ledgerBody'),
            searchInput: document.getElementById('searchInput'),
            riskFilter: document.getElementById('riskFilter'),
            ruleGrid: document.getElementById('ruleGrid'),
            totalTenders: document.getElementById('ui-total-tenders'),
            highRisk: document.getElementById('ui-high-risk'),
            mediumRisk: document.getElementById('ui-medium-risk'),
            totalValue: document.getElementById('ui-total-value'),
            pdfStatus: document.getElementById('pdfStatus'),
            pdfRemoteLink: document.getElementById('pdfRemoteLink'),
            pdfPageDisplay: document.getElementById('pdfPageDisplay'),
            fieldId: document.getElementById('fieldId'),
            fieldPdfFile: document.getElementById('fieldPdfFile'),
            fieldContractor: document.getElementById('fieldContractor'),
            fieldEntity: document.getElementById('fieldEntity'),
            fieldValue: document.getElementById('fieldValue'),
            fieldRisk: document.getElementById('fieldRisk'),
            fieldNotes: document.getElementById('fieldNotes'),
            verifyStatus: document.getElementById('verifyStatus'),
            riskChart: document.getElementById('riskChart')
        };

        const App = {
            init() {
                this.bindEvents();
                this.renderRuleCards();
                this.initChart();
                this.fetchData();
            },

            bindEvents() {
                let timer;
                DOM.searchInput.addEventListener('input', () => {
                    clearTimeout(timer);
                    timer = setTimeout(() => this.applyFilters(), 280);
                });
                DOM.riskFilter.addEventListener('change', () => this.applyFilters());
                [DOM.fieldContractor, DOM.fieldEntity, DOM.fieldValue, DOM.fieldRisk, DOM.fieldNotes].forEach(field => {
                    field.addEventListener('input', () => this.applyInspectorChanges());
                });
            },

            resetFilters() {
                DOM.searchInput.value = '';
                DOM.riskFilter.value = 'ALL';
                State.activeRule = null;
                document.querySelectorAll('.rule-card.active').forEach(card => card.classList.remove('active'));
                this.applyFilters();
            },

            async fetchData() {
                try {
                    const url = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/main/${CONFIG.FILE_PATH}?t=${Date.now()}`;
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Unable to fetch database (${res.status})`);
                    const json = await res.json();
                    State.originalJson = json;
                    State.jsonArray = this.extractArray(json);
                    State.data = State.jsonArray.map(item => this.normalizeRecord(item));
                    this.applyFilters();
                } catch (error) {
                    DOM.ledgerBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--netra-red);">Database load failed.<br><small style="color:var(--text-muted);">${error.message}</small></td></tr>`;
                }
            },

            extractArray(json) {
                if (Array.isArray(json)) return json;
                if (json && typeof json === 'object') {
                    if (Array.isArray(json.Merged_Database)) return json.Merged_Database;
                    const arrayKey = Object.keys(json).find(key => Array.isArray(json[key]));
                    return arrayKey ? json[arrayKey] : [];
                }
                return [];
            },

            normalizeRecord(item) {
                const riskRaw = String(item.Risk_Level || item.Risk || item.Red_Flag || 'LOW').trim().toUpperCase();
                const risk = ['HIGH', 'MEDIUM', 'LOW'].includes(riskRaw) ? riskRaw : (riskRaw === 'YES' ? 'HIGH' : 'LOW');
                const pdfFiles = this.extractPdfFiles(item);
                return {
                    id: item.Tender_Proposal_ID || item.App_ID || item.id || `NEW-${Date.now()}`,
                    contractor: item.Supplier_Name || item.Contractor || item.contractor || '',
                    entity: item.Procuring_Entity_Name || item.Organization_Agency || item.Procurement_Entity_District || item.entity || '',
                    value: item.Contract_Value_BDT || item.Document_Price_BDT || item.value || 0,
                    risk,
                    rules: item.Rule_Reference ? String(item.Rule_Reference).split(/[;,]/).map(text => text.trim()).filter(Boolean) : [],
                    pdfFiles,
                    pdfFile: pdfFiles[0] || '',
                    notes: item.Investigator_Notes || item.Notes || '',
                    raw: item
                };
            },

            extractPdfFiles(item) {
                const candidates = new Set();
                const collect = (value) => {
                    if (!value) return;
                    String(value).split(/[|,;]+/).forEach(fragment => {
                        const fileName = fragment.trim();
                        if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                            candidates.add(fileName);
                        }
                    });
                };
                collect(item.Source_File);
                collect(item.Source_Files_Merged);
                collect(item.Document_Link);
                return Array.from(candidates);
            },

            initChart() {
                State.chart = new Chart(DOM.riskChart, {
                    type: 'doughnut',
                    data: {
                        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                        datasets: [{ data: [0,0,0], backgroundColor: ['#ef4444','#f59e0b','#10b981'], borderWidth: 0 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f8fafc' }}}}
                });
            },

            applyFilters() {
                const searchTerm = DOM.searchInput.value.toLowerCase().trim();
                const riskFilter = DOM.riskFilter.value;
                State.filtered = State.data.filter(record => {
                    const matchesSearch = !searchTerm || [record.id, record.contractor, record.entity].some(field => String(field).toLowerCase().includes(searchTerm));
                    const matchesRisk = riskFilter === 'ALL' || record.risk === riskFilter;
                    const matchesRule = !State.activeRule || record.rules.includes(State.activeRule);
                    return matchesSearch && matchesRisk && matchesRule;
                });
                this.renderLedger();
                this.renderMetrics();
                this.updateChart();
            },

            renderMetrics() {
                const total = State.filtered.length;
                const high = State.filtered.filter(record => record.risk === 'HIGH').length;
                const medium = State.filtered.filter(record => record.risk === 'MEDIUM').length;
                const totalValue = State.filtered.reduce((sum, record) => sum + Number(record.value || 0), 0);
                DOM.totalTenders.textContent = total.toLocaleString('en-IN');
                DOM.highRisk.textContent = high.toLocaleString('en-IN');
                DOM.mediumRisk.textContent = medium.toLocaleString('en-IN');
                DOM.totalValue.textContent = `৳ ${totalValue.toLocaleString('en-IN')}`;
            },

            updateChart() {
                if (!State.chart) return;
                State.chart.data.datasets[0].data = [
                    State.filtered.filter(r => r.risk === 'HIGH').length,
                    State.filtered.filter(r => r.risk === 'MEDIUM').length,
                    State.filtered.filter(r => r.risk === 'LOW').length
                ];
                State.chart.update();
            },

            escapeHtml(value) {
                return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            },

            renderLedger() {
                if (!State.filtered.length) {
                    DOM.ledgerBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No records match the current criteria.</td></tr>`;
                    return;
                }
                DOM.ledgerBody.innerHTML = State.filtered.slice(0, 150).map(record => {
                    const valueText = Number(record.value || 0).toLocaleString('en-IN');
                    const entityValue = this.escapeHtml(record.entity || '');
                    const contractorValue = this.escapeHtml(record.contractor || '');
                    return `
                        <tr>
                            <td><strong>${this.escapeHtml(record.id)}</strong></td>
                            <td><input type="text" value="${entityValue}" onchange="App.updateInlineField('${record.id}', 'entity', this.value)" style="width:100%; border:1px solid rgba(255,255,255,0.12); border-radius:8px; background:#0b1220; color:var(--text-light); padding:8px 10px;"></td>
                            <td><input type="text" value="${contractorValue}" onchange="App.updateInlineField('${record.id}', 'contractor', this.value)" style="width:100%; border:1px solid rgba(255,255,255,0.12); border-radius:8px; background:#0b1220; color:var(--text-light); padding:8px 10px;"></td>
                            <td>
                                <select onchange="App.updateInlineField('${record.id}', 'risk', this.value)" style="width:100%; border:1px solid rgba(255,255,255,0.12); border-radius:8px; background:#0b1220; color:var(--text-light); padding:8px 10px;">
                                    <option value="LOW" ${record.risk === 'LOW' ? 'selected' : ''}>LOW</option>
                                    <option value="MEDIUM" ${record.risk === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
                                    <option value="HIGH" ${record.risk === 'HIGH' ? 'selected' : ''}>HIGH</option>
                                </select>
                            </td>
                            <td style="text-align:right; font-family:monospace;"><input type="number" min="0" value="${Number(record.value || 0)}" onchange="App.updateInlineField('${record.id}', 'value', this.value)" style="width:100%; border:1px solid rgba(255,255,255,0.12); border-radius:8px; background:#0b1220; color:var(--text-light); padding:8px 10px; text-align:right;"></td>
                            <td style="text-align:center; display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
                                <button class="btn-outline" onclick="App.openVerifyModal('${record.id}')">Full Edit</button>
                                <button class="btn-clear" onclick="App.deleteRecord('${record.id}')">Delete</button>
                                <button class="btn-outline" onclick="App.highlightPdf('${record.id}')">PDF</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            },

            async openVerifyModal(id) {
                const record = State.data.find(item => item.id == id);
                if (!record) return alert('Record not found.');
                State.activeId = record.id;
                State.activePdfFile = record.pdfFile || record.pdfFiles[0] || '';
                DOM.fieldId.value = record.id;
                DOM.fieldPdfFile.value = State.activePdfFile || 'No PDF attached';
                DOM.fieldContractor.value = record.contractor;
                DOM.fieldEntity.value = record.entity;
                DOM.fieldValue.value = record.value;
                DOM.fieldRisk.value = record.risk;
                DOM.fieldNotes.value = record.notes || '';
                DOM.verifyStatus.textContent = 'Loaded record for verification. Make edits and save when ready.';
                DOM.verifyStatus.style.color = 'var(--text-muted)';
                this.renderPdfChoiceList(record.pdfFiles, State.activePdfFile);
                this.setModalOpen('verifyModal');
                if (State.activePdfFile) await this.loadPdfFile(State.activePdfFile);
                else { DOM.pdfStatus.textContent = 'No PDF source configured for this record.'; DOM.pdfPageDisplay.textContent = 'Page 0 / 0'; }
            },

            setModalOpen(id) {
                const modal = document.getElementById(id);
                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
            },

            closeModal(id) {
                const modal = document.getElementById(id);
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
            },

            async loadPdfFile(pdfFile) {
                if (!pdfFile) {
                    DOM.pdfStatus.textContent = 'No PDF file selected.';
                    DOM.pdfPageDisplay.textContent = 'Page 0 / 0';
                    return;
                }
                const localUrls = CONFIG.LOCAL_PDF_URLS(pdfFile);
                const remoteUrls = CONFIG.REMOTE_PDF_URLS(pdfFile);
                DOM.pdfRemoteLink.href = remoteUrls[0] || '#';
                let loaded = false;
                State.activePdfUrl = null;
                DOM.pdfStatus.textContent = 'Loading PDF...';
                for (const url of [...localUrls, ...remoteUrls]) {
                    try {
                        await this.loadPdfDocument(url);
                        loaded = true;
                        const isLocal = localUrls.includes(url);
                        DOM.pdfStatus.textContent = isLocal ? 'Loaded from local folder.' : 'Loaded from GitHub.';
                        DOM.pdfRemoteLink.href = url;
                        State.activePdfUrl = url;
                        State.activePdfFile = pdfFile;
                        break;
                    } catch (error) {
                        console.warn('PDF load failed:', url, error.message);
                    }
                }
                if (!loaded) {
                    DOM.pdfStatus.textContent = 'Unable to load PDF from local or GitHub. Use the manual link above.';
                    DOM.pdfPageDisplay.textContent = 'Page 0 / 0';
                }
            },

            async loadPdfDocument(url) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const loadingTask = pdfjsLib.getDocument(url);
                State.pdfDoc = await loadingTask.promise;
                State.currentPdfPage = 1;
                State.totalPdfPages = State.pdfDoc.numPages;
                this.renderPdfPage(State.currentPdfPage);
            },

            renderPdfPage(pageNum) {
                if (!State.pdfDoc) return;
                const pageIndex = Math.max(1, Math.min(pageNum, State.totalPdfPages));
                State.currentPdfPage = pageIndex;
                State.pdfDoc.getPage(pageIndex).then(page => {
                    const viewport = page.getViewport({ scale: 1.3 });
                    const canvas = document.getElementById('pdfCanvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    page.render({ canvasContext: context, viewport });
                    DOM.pdfPageDisplay.textContent = `Page ${pageIndex} / ${State.totalPdfPages}`;
                }).catch(error => {
                    console.error('Render PDF error', error);
                    DOM.pdfStatus.textContent = 'Unable to render PDF page.';
                });
            },

            changePdfPage(delta) {
                if (!State.pdfDoc) return;
                const nextPage = State.currentPdfPage + delta;
                if (nextPage < 1 || nextPage > State.totalPdfPages) return;
                this.renderPdfPage(nextPage);
            },

            openPdfInNewTab() {
                if (State.activePdfUrl) {
                    window.open(State.activePdfUrl, '_blank');
                    return;
                }
                const record = State.data.find(item => item.id == State.activeId);
                const pdfFile = State.activePdfFile || (record && record.pdfFile);
                if (!record || !pdfFile) return;
                const localUrls = CONFIG.LOCAL_PDF_URLS(pdfFile);
                const target = localUrls[0] || CONFIG.REMOTE_PDF_URLS(pdfFile)[0];
                if (target) window.open(target, '_blank');
            },

            updateInlineField(id, field, value) {
                const record = State.data.find(item => String(item.id) === String(id));
                if (!record) return;

                if (field === 'value') {
                    record.value = Number(value) || 0;
                } else if (field === 'risk') {
                    record.risk = String(value).toUpperCase();
                } else {
                    record[field] = String(value).trim();
                }

                this.applyNormalizedChangesToRaw(record);
                this.applyFilters();

                if (State.activeId && String(State.activeId) === String(id)) {
                    DOM.fieldContractor.value = record.contractor || '';
                    DOM.fieldEntity.value = record.entity || '';
                    DOM.fieldValue.value = record.value || 0;
                    DOM.fieldRisk.value = record.risk || 'LOW';
                }

                DOM.verifyStatus.textContent = 'Inline edits updated locally. Use Full Edit or Save to sync.';
                DOM.verifyStatus.style.color = '#7dd3fc';
            },

            applyInspectorChanges() {
                const record = State.data.find(item => item.id == State.activeId);
                if (!record) return;
                record.contractor = DOM.fieldContractor.value.trim();
                record.entity = DOM.fieldEntity.value.trim();
                record.value = Number(DOM.fieldValue.value) || 0;
                record.risk = DOM.fieldRisk.value;
                record.notes = DOM.fieldNotes.value.trim();
                this.applyNormalizedChangesToRaw(record);
                this.applyFilters();
                DOM.verifyStatus.textContent = State.sessionToken ? 'Draft saved locally and scheduled for auto-sync.' : 'Draft saved locally. Enter GitHub PAT and save to commit.';
                DOM.verifyStatus.style.color = State.sessionToken ? '#7dd3fc' : '#fbbf24';
                if (State.sessionToken) this.scheduleAutoSave();
            },

            applyNormalizedChangesToRaw(record) {
                const raw = record.raw || {};
                raw.Tender_Proposal_ID = record.id;
                raw.Supplier_Name = record.contractor;
                raw.Contractor = record.contractor;
                raw.Procuring_Entity_Name = record.entity;
                raw.Organization_Agency = record.entity;
                raw.Contract_Value_BDT = record.value;
                raw.Document_Price_BDT = record.value;
                raw.Risk_Level = record.risk;
                raw.Red_Flag = record.risk === 'HIGH' ? 'YES' : 'NO';
                raw.Investigator_Notes = record.notes;
            },

            scheduleAutoSave() {
                if (State.autoSaveTimer) clearTimeout(State.autoSaveTimer);
                State.autoSaveTimer = setTimeout(async () => {
                    DOM.verifyStatus.textContent = '⏳ Auto-syncing changes to GitHub...';
                    const success = await this.secureGitHubSave();
                    if (success) DOM.verifyStatus.textContent = '✅ Auto-synced changes to GitHub.';
                }, 1800);
            },

            saveRecord() {
                const record = State.data.find(item => item.id == State.activeId);
                if (!record) return;
                this.applyInspectorChanges();
                if (!State.sessionToken) {
                    DOM.verifyStatus.textContent = 'Enter GitHub PAT to save remotely.';
                    DOM.verifyStatus.style.color = '#fbbf24';
                    return;
                }
                this.secureGitHubSave();
            },

            deleteRecord(id = State.activeId) {
                const record = State.data.find(item => String(item.id) === String(id));
                if (!record) return;
                const confirmed = window.confirm(`Delete record ${record.id}? This removes it from the current ledger and can sync the change to GitHub.`);
                if (!confirmed) return;

                State.data = State.data.filter(item => String(item.id) !== String(id));
                State.jsonArray = State.jsonArray.filter(item => {
                    const rawId = item.Tender_Proposal_ID ?? item.App_ID ?? item.id;
                    return String(rawId) !== String(id);
                });

                if (State.activeId && String(State.activeId) === String(id)) {
                    this.closeModal('verifyModal');
                    State.activeId = null;
                }

                this.applyFilters();
                if (State.sessionToken) {
                    this.secureGitHubSave();
                } else {
                    DOM.verifyStatus.textContent = 'Record deleted locally. Enter GitHub PAT if you want to sync the removal.';
                    DOM.verifyStatus.style.color = '#fbbf24';
                }
            },

            async secureGitHubSave() {
                if (!State.sessionToken) {
                    State.sessionToken = prompt('Enter GitHub Personal Access Token (PAT) to commit changes. This token remains in RAM only.');
                    if (!State.sessionToken) return false;
                }
                try {
                    const sha = await this.getRemoteFileSha();
                    const payload = this.buildPayload();
                    const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
                    const res = await fetch(CONFIG.API_URL(), {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${State.sessionToken}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: 'Update procurement record via e-GP forensic workspace', content, sha })
                    });
                    if (!res.ok) throw new Error(`GitHub save failed (${res.status})`);
                    DOM.verifyStatus.textContent = '✅ Saved securely to GitHub.';
                    DOM.verifyStatus.style.color = '#34d399';
                    return true;
                } catch (error) {
                    console.error(error);
                    DOM.verifyStatus.textContent = `❌ ${error.message}`;
                    DOM.verifyStatus.style.color = '#ef4444';
                    State.sessionToken = null;
                    return false;
                }
            },

            async getRemoteFileSha() {
                const res = await fetch(CONFIG.API_URL(), { headers: { Authorization: `Bearer ${State.sessionToken}` } });
                if (!res.ok) throw new Error('Unable to verify GitHub file SHA');
                const data = await res.json();
                return data.sha;
            },

            buildPayload() {
                if (Array.isArray(State.originalJson)) return State.jsonArray;
                const payload = JSON.parse(JSON.stringify(State.originalJson || {}));
                const key = Array.isArray(payload.Merged_Database) ? 'Merged_Database' : Object.keys(payload).find(k => Array.isArray(payload[k]));
                if (key) payload[key] = State.jsonArray;
                return key ? payload : State.jsonArray;
            },

            createNewRecord() {
                const newId = `NEW-${Date.now()}`;
                const rawRecord = { Tender_Proposal_ID: newId, Risk_Level: 'LOW', Red_Flag: 'NO', Investigator_Notes: '' };
                const record = this.normalizeRecord(rawRecord);
                record.raw = rawRecord;
                State.jsonArray.unshift(rawRecord);
                State.data.unshift(record);
                this.applyFilters();
                this.openVerifyModal(record.id);
            },

            toggleRuleFilter(ruleId, el) {
                const cards = document.querySelectorAll('.rule-card');
                cards.forEach(card => card.classList.remove('active'));
                if (State.activeRule === ruleId) {
                    State.activeRule = null;
                } else {
                    State.activeRule = ruleId;
                    el.classList.add('active');
                }
                this.applyFilters();
            },

            highlightPdf(id) {
                this.openVerifyModal(id);
            },

            refreshData() {
                if (window.confirm('Reload dataset from GitHub and discard unsaved local changes?')) {
                    State.sessionToken = null;
                    this.fetchData();
                }
            },

            openNetworkMap() {
                if (!State.data.length) return alert('No data to display in network map.');
                this.setModalOpen('networkModal');
                const nodes = new vis.DataSet();
                const edges = new vis.DataSet();
                const entityMap = {};
                const contractorMap = {};
                State.data.slice(0, 800).forEach((record, idx) => {
                    if (!record.entity || !record.contractor) return;
                    if (!entityMap[record.entity]) {
                        entityMap[record.entity] = { id: `E-${idx}`, label: record.entity, group: 'entity' };
                        nodes.add(entityMap[record.entity]);
                    }
                    if (!contractorMap[record.contractor]) {
                        contractorMap[record.contractor] = { id: `C-${idx}`, label: record.contractor, group: 'contractor' };
                        nodes.add(contractorMap[record.contractor]);
                    }
                    edges.add({ from: entityMap[record.entity].id, to: contractorMap[record.contractor].id, value: Number(record.value) || 1, title: `Value: ৳${Number(record.value || 0).toLocaleString('en-IN')}` });
                });
                const data = { nodes, edges };
                const options = {
                    physics: { stabilization: true, barnesHut: { gravitationalConstant: -1400, centralGravity: 0.25, springLength: 140 } },
                    groups: { entity: { shape: 'box', color: { background: '#f59e0b' } }, contractor: { shape: 'dot', color: { background: '#ef4444' } } },
                    edges: { color: { color: '#38bdf8', highlight: '#ef4444' }, smooth: { enabled: true, type: 'dynamic' } },
                    nodes: { font: { color: '#fff' }, borderWidth: 2 }
                };
                new vis.Network(document.getElementById('networkGraph'), data, options);
            },

            openReportModal() {
                const reportContent = document.getElementById('reportContent');
                const flagged = State.data.filter(record => record.risk === 'HIGH');
                if (!flagged.length) {
                    reportContent.innerHTML = `<div class="report-row"><strong>No high-risk contracts currently flagged.</strong></div>`;
                } else {
                    const summary = `Flagged High-Risk Contracts: ${flagged.length}`;
                    reportContent.innerHTML = `
                        <div class="report-header"><div><h3>Investigative Report Summary</h3><p>${summary}</p></div></div>
                        <table class="report-table"><thead><tr><th>ID</th><th>Entity</th><th>Contractor</th><th>Value</th><th>Notes</th></tr></thead><tbody>
                            ${flagged.map(record => `<tr><td>${record.id}</td><td>${record.entity || '-'}</td><td>${record.contractor || '-'}</td><td>৳ ${Number(record.value || 0).toLocaleString('en-IN')}</td><td>${record.notes || 'No notes provided'}</td></tr>`).join('')}
                        </tbody></table>
                    `;
                }
                this.setModalOpen('reportModal');
            },

            renderPdfChoiceList(files, selectedFile) {
                const container = document.getElementById('pdfChoiceList');
                if (!files || !files.length) {
                    container.innerHTML = '<span style="color:var(--text-muted);">No PDF attachments</span>';
                    return;
                }
                container.innerHTML = files.map(file => `
                    <button type='button' class='${file === selectedFile ? 'active' : ''}' onclick='App.selectPdfFile(${JSON.stringify(file)})'>${file}</button>
                `).join('');
            },

            selectPdfFile(pdfFile) {
                const record = State.data.find(item => item.id == State.activeId);
                if (!record || !pdfFile) return;
                State.activePdfFile = pdfFile;
                record.pdfFile = pdfFile;
                DOM.fieldPdfFile.value = pdfFile;
                this.renderPdfChoiceList(record.pdfFiles, pdfFile);
                this.loadPdfFile(pdfFile);
            },

            exportCSV() {
                const rows = [['ID', 'Entity', 'Contractor', 'Risk', 'Value', 'PDF File', 'Notes']];
                State.filtered.forEach(record => rows.push([record.id, record.entity, record.contractor, record.risk, record.value, record.pdfFile || '', record.notes || '']));
                const csv = rows.map(row => row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `EGP_Records_${Date.now()}.csv`;
                link.click();
            }
        };

        App.init();
    