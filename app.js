// JS Start here ---
let audioCtx = null;
        let sessionCountTimer = null;
        const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

        function triggerVibration(vibeArray) {
            if ("vibrate" in navigator) { navigator.vibrate(vibeArray); }
        }

        // ANDROID NATIVE POPUP ENGINE (REPLACES BROWSER ALERT & CONFIRM)
        function spawnNativeAndroidPopup(title, message, iconType, isConfirm, resolveCallback) {
            triggerVibration(25);
            const wrapper = document.getElementById('native-popup-scaffold');
            const iconFrame = document.getElementById('popup-icon-frame');
            const bodyText = document.getElementById('popup-body-text');
            const actionsBlock = document.getElementById('popup-actions-wrapper');

            bodyText.innerText = message;
            actionsBlock.innerHTML = ""; 

            if(iconType === 'error') {
                iconFrame.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-red-950 text-red-400 border border-red-800/40";
                iconFrame.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            } else if(iconType === 'success') {
                iconFrame.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-emerald-950 text-emerald-400 border border-emerald-800/40";
                iconFrame.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            } else {
                iconFrame.className = "w-9 h-9 rounded-xl flex items-center justify-center text-sm bg-blue-950 text-blue-400 border border-blue-800/40";
                iconFrame.innerHTML = '<i class="fa-solid fa-shield-halved"></i>';
            }

            if(isConfirm) {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = "px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 text-[10px] uppercase font-bold transition cursor-pointer";
                cancelBtn.innerText = "रद्द करें (Abort)";
                cancelBtn.onclick = () => { wrapper.classList.add('hidden'); resolveCallback(false); };
                actionsBlock.appendChild(cancelBtn);

                const confirmBtn = document.createElement('button');
                confirmBtn.className = "px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] uppercase font-bold transition cursor-pointer shadow-md";
                confirmBtn.innerText = "पुष्टि करें (Confirm)";
                confirmBtn.onclick = () => { wrapper.classList.add('hidden'); resolveCallback(true); };
                actionsBlock.appendChild(confirmBtn);
            } else {
                const okBtn = document.createElement('button');
                okBtn.className = "px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold transition cursor-pointer shadow-md";
                okBtn.innerText = "ठीक है (OK)";
                okBtn.onclick = () => { wrapper.classList.add('hidden'); if(resolveCallback) resolveCallback(true); };
                actionsBlock.appendChild(okBtn);
            }
            wrapper.classList.remove('hidden');
        }

        function runRealTimeClockEngine() {
            const timeTargetNode = document.getElementById('live-audit-timestamp');
            setInterval(() => {
                const now = new Date();
                const formattedDate = now.toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: '2-digit' });
                const formattedTime = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                timeTargetNode.innerText = `समय सिंक: ${formattedDate} | ${formattedTime}`;
            }, 1000);
        }

        // HANDLES DYNAMIC INTERACTION OF DISTRICT VS BLOCK OPTIONS
        function handleDistrictChange(districtValue) {
            const blockSelect = document.getElementById('form-block');
            
            // Resets state completely first
            blockSelect.innerHTML = '<option value="">-- अंचल/ब्लॉक चुनें --</option>';
            
            // Injecting specific valid blocks only if Saran (Value: 17) is chosen
            if (districtValue === "17") {
                const saranBlocks = [
                    { val: "17", name: "अमनौर" },
                    { val: "4",  name: "बनियापुर" },
                    { val: "18", name: "दरियापुर" },
                    { val: "19", name: "दिघवारा" },
                    { val: "6",  name: "एकमा" },
                    { val: "11", name: "गरखा" },
                    { val: "15", name: "इसuवापुर" },
                    { val: "7",  name: "जलालपुर" },
                    { val: "5",  name: "लाहलादपुर" },
                    { val: "9",  name: "मकेर" },
                    { val: "3",  name: "मांझी" },
                    { val: "12", name: "मरहौरा" },
                    { val: "16", name: "मशरख" },
                    { val: "8",  name: "नागरा" },
                    { val: "13", name: "पनापुर" },
                    { val: "10", name: "परसा" },
                    { val: "2",  name: "रिविलगंज" },
                    { val: "1",  name: "सारण सदर" },
                    { val: "20", name: "सोनपुर" },
                    { val: "14", name: "तरैया" }
                ];
                
                saranBlocks.forEach(block => {
                    let opt = document.createElement('option');
                    opt.value = block.val;
                    opt.textContent = block.name;
                    blockSelect.appendChild(opt);
                });
            } else {
                blockSelect.innerHTML = '<option value="">-- इस जिले के ब्लॉक उपलब्ध नहीं हैं --</option>';
            }
        }

        function switchAuthStep(roleSelection) {
            document.getElementById('user-role-input').value = roleSelection;
            document.getElementById('role-selection-node').classList.add('hidden');
            
            const formNode = document.getElementById('metadata-form-node');
            const titleBadge = document.getElementById('form-title-badge');
            const emailField = document.getElementById('email-field-block');
            const govtBlock = document.getElementById('govt-designation-block');

            formNode.classList.remove('hidden');
            triggerVibration(25);
            clearValidationFormattingErrors();

            if (roleSelection === 'public') {
                titleBadge.innerText = "पब्लिक एक्सेस";
                titleBadge.className = "ml-auto text-[9px] px-2 py-0.5 font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                emailField.classList.add('hidden');
                govtBlock.classList.add('hidden');
            } else {
                titleBadge.innerText = "अधिकारी एडमिन लॉगिन";
                titleBadge.className = "ml-auto text-[9px] px-2 py-0.5 font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                emailField.classList.remove('hidden');
                govtBlock.classList.remove('hidden');
            }
        }

        function revertAuthStep() {
            document.getElementById('metadata-form-node').classList.add('hidden');
            document.getElementById('role-selection-node').classList.remove('hidden');
            triggerVibration(15);
        }

        function clearValidationFormattingErrors() {
            document.querySelectorAll('#metadata-form-node input, #metadata-form-node select').forEach(element => {
                element.classList.remove('input-error-state');
                const errMsg = element.parentElement.querySelector('.error-msg-node');
                if(errMsg) errMsg.classList.add('hidden');
            });
        }

        function commitUserAuthentication(event) {
            event.preventDefault();
            clearValidationFormattingErrors();

            const role = document.getElementById('user-role-input').value;
            const nameNode = document.getElementById('form-name');
            const phoneNode = document.getElementById('form-phone');
            const emailNode = document.getElementById('form-email');
            const districtNode = document.getElementById('form-district');
            const blockNode = document.getElementById('form-block');
            const designationNode = document.getElementById('form-designation');

            let compilationValid = true;

            if(!nameNode.value.trim()) { flagValidationError(nameNode); compilationValid = false; }
            if(phoneNode.value.length !== 10) { flagValidationError(phoneNode); compilationValid = false; }
            if(!districtNode.value) { flagValidationError(districtNode); compilationValid = false; }
            if(!blockNode.value || blockNode.value === "") { flagValidationError(blockNode); compilationValid = false; }

            if(role === 'govt') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailRegex.test(emailNode.value.trim())) { flagValidationError(emailNode); compilationValid = false; }
                if(!designationNode.value.trim()) { flagValidationError(designationNode); compilationValid = false; }
            }

            if(!compilationValid) {
                triggerVibration([50, 50, 50]);
                return false;
            }

            // Extracting actual localized text names from dropdown layout instead of raw numerical IDs
            const textDistrictValue = districtNode.options[districtNode.selectedIndex].text;
            const textBlockValue = blockNode.options[blockNode.selectedIndex] ? blockNode.options[blockNode.selectedIndex].text : "N/A";

            const profileObject = {
                role: role,
                name: nameNode.value.trim(),
                phone: phoneNode.value.trim(),
                email: role === 'govt' ? emailNode.value.trim() : 'N/A',
                district: textDistrictValue,
                block: textBlockValue,
                designation: role === 'govt' ? designationNode.value.trim() : 'N/A',
                timestamp: Date.now()
            };

            // Session stored strictly for temporary state verification
            sessionStorage.setItem('saran_active_session_token', 'true');
            localStorage.setItem('saran_kernel_auth_v2', JSON.stringify(profileObject));
            
            applyUserCredentialsSystemState(profileObject);
            document.getElementById('auth-modal-screen').classList.add('opacity-0', 'pointer-events-none');
            
            evaluateNetworkTopology();
            initializeActivityTimerSequence();
            checkAndLoadInjectedPrdLink();
        }

        function flagValidationError(inputElement) {
            inputElement.classList.add('input-error-state');
            const errMsg = inputElement.parentElement.querySelector('.error-msg-node');
            if(errMsg) errMsg.classList.remove('hidden');
        }

        function applyUserCredentialsSystemState(profile) {
            const firstLetter = profile.name.charAt(0).toUpperCase();
            const avatarTrigger = document.getElementById('user-avatar-trigger');
            avatarTrigger.innerText = firstLetter;
            
            const injectorPanel = document.getElementById('admin-url-injector-panel');
            if(profile.role === 'govt') {
                avatarTrigger.className = "w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center border border-indigo-400/30 cursor-pointer";
                injectorPanel.classList.remove('hidden'); 
            } else {
                avatarTrigger.className = "w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center border border-emerald-400/30 cursor-pointer";
                injectorPanel.classList.add('hidden'); 
            }

            document.getElementById('modal-avatar-node').innerText = firstLetter;
            document.getElementById('modal-profile-name').innerText = profile.name;
            document.getElementById('modal-profile-role').innerText = profile.role === 'govt' ? 'GOVT ADMIN' : 'PUBLIC USER';
            document.getElementById('modal-profile-phone').innerText = profile.phone;
            document.getElementById('modal-profile-email').innerText = profile.email;
            document.getElementById('modal-profile-district').innerText = profile.district;
            document.getElementById('modal-profile-block').innerText = profile.block;

            const designationWrapper = document.getElementById('modal-designation-wrapper');
            if(profile.role === 'govt') {
                designationWrapper.classList.remove('hidden');
                document.getElementById('modal-profile-designation').innerText = profile.designation;
                document.getElementById('modal-profile-role').className = "text-[9px] font-bold px-2 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
            } else {
                designationWrapper.classList.add('hidden');
                document.getElementById('modal-profile-role').className = "text-[9px] font-bold px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/20";
            }
        }

        // REFRESH FRIENDLY VERIFICATION & PERSISTENT SESSION RETRIEVAL
        function verifyAuthenticationPersistence() {
            const cachedToken = localStorage.getItem('saran_kernel_auth_v2');
            const sessionActive = sessionStorage.getItem('saran_active_session_token');
            
            if (cachedToken && sessionActive) {
                try {
                    const parsedProfile = JSON.parse(cachedToken);
                    applyUserCredentialsSystemState(parsedProfile);
                    document.getElementById('auth-modal-screen').classList.add('hidden');
                    initializeActivityTimerSequence();
                } catch(err) {
                    clearSessionMemory();
                }
            } else {
                clearSessionMemory();
            }
        }

        function clearSessionMemory() {
            localStorage.removeItem('saran_kernel_auth_v2');
            sessionStorage.removeItem('saran_active_session_token');
        }

        function toggleProfileOverlay(showOverlayState) {
            const overlayNode = document.getElementById('profile-overlay-modal');
            if(showOverlayState) {
                overlayNode.classList.remove('hidden');
                triggerVibration(15);
            } else {
                overlayNode.classList.add('hidden');
            }
        }

        function destroySessionTerminalTrigger() {
            spawnNativeAndroidPopup(
                "लॉगआउट पुष्टीकरण",
                "क्या आप वाकई इस डिवाइस से लॉगआउट करना चाहते हैं? लॉगआउट करने के बाद आपको दोबारा अपनी डिटेल्स भरनी होंगी।",
                "warning",
                true,
                (isConfirmed) => {
                    if(isConfirmed) {
                        terminateSessionGracefully();
                    }
                }
            );
        }

        function terminateSessionGracefully() {
            clearSessionMemory();
            
            document.getElementById('profile-overlay-modal').classList.add('hidden');
            document.getElementById('timeout-expiry-modal').classList.add('hidden');
            
            document.getElementById('form-name').value = "";
            document.getElementById('form-phone').value = "";
            document.getElementById('form-email').value = "";
            document.getElementById('form-district').value = "";
            document.getElementById('form-block').value = "";
            document.getElementById('form-designation').value = "";
            
            const authModal = document.getElementById('auth-modal-screen');
            authModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
            revertAuthStep();
            
            if(sessionCountTimer) clearTimeout(sessionCountTimer);
        }

        function initializeActivityTimerSequence() {
            if(sessionCountTimer) clearTimeout(sessionCountTimer);
            sessionCountTimer = setTimeout(() => {
                document.getElementById('timeout-expiry-modal').classList.remove('hidden');
                triggerVibration([200, 100, 200]);
            }, TEN_MINUTES_IN_MS);
        }

        function extendSessionLifeCycle() {
            document.getElementById('timeout-expiry-modal').classList.add('hidden');
            initializeActivityTimerSequence();
            showNetworkToastStream("bg-indigo-950 border-indigo-800 text-indigo-300", "fa-solid fa-clock-rotate-left", "आपका लॉगिन सत्र सफलतापूर्वक बढ़ा दिया गया है।");
        }

        ['click', 'scroll', 'keypress', 'touchstart'].forEach(eventName => {
            window.addEventListener(eventName, () => {
                const cachedToken = localStorage.getItem('saran_kernel_auth_v2');
                if(cachedToken && document.getElementById('timeout-expiry-modal').classList.contains('hidden')) {
                    initializeActivityTimerSequence();
                }
            });
        });

        // REFRESH PERSISTENT PRD LINK INJECTION METHOD
        function executePrdLinkInjectionStream() {
            const rawUrlInput = document.getElementById('prd-url-injector-input').value.trim();
            
            if(!rawUrlInput) {
                spawnNativeAndroidPopup("त्रुटि", "यूआरएल इनपुट बॉक्स खाली नहीं हो सकता। कृपया सही लिंक डालें।", "error", false);
                return;
            }

            triggerVibration(40);
            
            // Link strictly saved globally in LocalStorage so it retains even on cross refresh cycles
            localStorage.setItem('prd_injected_stream_url', rawUrlInput);
            
            loadUrlIntoPrdIframe(rawUrlInput);
        }

        function loadUrlIntoPrdIframe(url) {
            const iframeElement = document.getElementById('prd-live-iframe');
            const placeholderSlate = document.getElementById('prd-placeholder-slate');

            placeholderSlate.innerHTML = '<div class="w-8 h-8 border-4 border-t-teal-500 border-slate-800 rounded-full animate-spin mb-2"></div><span class="text-[10px] text-teal-400 font-bold uppercase">प्रशासनिक कस्टम ग्रिड लोड हो रहा है...</span>';
            placeholderSlate.classList.remove('hidden');

            iframeElement.setAttribute('data-src', url);
            iframeElement.src = url;

            iframeElement.onload = () => {
                placeholderSlate.classList.add('hidden');
                showNetworkToastStream("bg-teal-950 border-teal-800 text-teal-300", "fa-solid fa-circle-check", "नया पंचायती राज डैशबोर्ड लिंक सफलतापूर्वक सिंक हो गया है!");
            };
        }

        // COMPATIBILITY MONITOR TO RUN EVERY TIME PAGE LOADS OR BOOTS UP
        function checkAndLoadInjectedPrdLink() {
            const persistentUrl = localStorage.getItem('prd_injected_stream_url');
            if(persistentUrl) {
                loadUrlIntoPrdIframe(persistentUrl);
            }
        }

        function showNetworkToastStream(styleClasses, iconClass, messageText) {
            const toast = document.getElementById('network-toast');
            const icon = document.getElementById('toast-icon');
            const msg = document.getElementById('toast-msg');

            toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 max-w-sm w-[92%] text-[10px] font-bold ${styleClasses} translate-y-0 opacity-100`;
            icon.className = iconClass;
            msg.innerText = messageText;

            setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3500);
        }

        function evaluateNetworkTopology() {
            const isOnline = navigator.onLine;
            const statusDot = document.getElementById('pulse-dot');
            const statusLabel = document.getElementById('status-label');

            if(!localStorage.getItem('saran_kernel_auth_v2')) return;

            if (isOnline) {
                statusLabel.innerText = "लाइव सिंक सक्रिय";
                statusDot.className = "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse";
                showNetworkToastStream("bg-emerald-950 border-emerald-800 text-emerald-300", "fa-solid fa-wifi", "इंटरनेट चालू है! डेटा रिफ्रेश हो रहा है।");
            } else {
                statusLabel.innerText = "ऑफलाइन मोड";
                statusDot.className = "w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse";
                showNetworkToastStream("bg-rose-950 border-rose-800 text-rose-300", "fa-solid fa-plane-slash", "इंटरनेट बंद है। पुराना सेव्ड कैश डेटा प्रदर्शित हो रहा है।");
            }
        }

        window.addEventListener('online', evaluateNetworkTopology);
        window.addEventListener('offline', evaluateNetworkTopology);

        window.addEventListener('DOMContentLoaded', () => {
            verifyAuthenticationPersistence();
            runRealTimeClockEngine();
            checkAndLoadInjectedPrdLink(); // Ensures link stays operational on load

            const explicitSavedTheme = localStorage.getItem('saran-core-theme') || 'dark-mode';
            document.body.className = explicitSavedTheme + " font-sans transition-colors duration-300 overflow-x-hidden select-none";
            evaluateAndToggleIconTrayGraphics(explicitSavedTheme);
            
            setTimeout(() => {
                document.getElementById('global-loader').classList.add('opacity-0', 'pointer-events-none');
                executeScrollSpyEngine(); mountLazyIntersectionObservers();
            }, 1200);
        });

       function toggleTheme() {
    // Android dynamic status bar meta tag ko select karein
    const themeMetaTag = document.querySelector('meta[name="theme-color"]');
    
    if (document.body.classList.contains('dark-mode')) {
        // 1. LIGHT MODE ACTIVATION
        document.body.classList.replace('dark-mode', 'light-mode');
        localStorage.setItem('saran-core-theme', 'light-mode');
        evaluateAndToggleIconTrayGraphics('light-mode');
        
        // Android Top Header Color: Light mode ke liye ekdum clean white (#ffffff) ya light gray
        if (themeMetaTag) themeMetaTag.setAttribute('content', '#f8fafc'); 
        
        triggerVibration([40, 30, 20]); // Cascade down vibration effect
    } else {
        // 2. DARK MODE ACTIVATION
        document.body.classList.replace('light-mode', 'dark-mode');
        localStorage.setItem('saran-core-theme', 'dark-mode');
        evaluateAndToggleIconTrayGraphics('dark-mode');
        
        // Android Top Header Color: Dark mode ke liye deep dark slate blue (#020617)
        if (themeMetaTag) themeMetaTag.setAttribute('content', '#020617');
        
        triggerVibration([20, 30, 40]); // Cascade up vibration effect
    }
}

        function evaluateAndToggleIconTrayGraphics(currentThemeMode) {
            const icon = document.getElementById('theme-icon');
            if (currentThemeMode === 'light-mode') {
                icon.className = "fa-solid fa-moon text-slate-800";
                icon.parentElement.className = "w-9 h-9 rounded-xl bg-card border flex items-center justify-center text-slate-800 shadow-sm";
            } else {
                icon.className = "fa-solid fa-sun text-amber-500";
                icon.parentElement.className = "w-9 h-9 rounded-xl bg-card border flex items-center justify-center text-amber-500 shadow-sm";
            }
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar-panel');
            if(sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.remove('-translate-x-full'); triggerVibration(30);
            } else { sidebar.classList.add('-translate-x-full'); }
        }

        document.querySelectorAll('#spy-navigation a').forEach(anchorNode => {
            anchorNode.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchorNode.getAttribute('href');
                const targetDomElement = document.querySelector(targetId);
                document.getElementById('section-loader').classList.remove('hidden');
                triggerVibration(15);
                setTimeout(() => {
                    document.getElementById('section-loader').classList.add('hidden');
                    if (window.innerWidth < 768) toggleSidebar(); 
                    targetDomElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400);
            });
        });

        function executeScrollSpyEngine() {
            const sections = document.querySelectorAll('main section');
            const navItems = document.querySelectorAll('.nav-item');
            const scrollBox = document.getElementById('main-content-scroll-box');
            
            scrollBox.addEventListener('scroll', () => {
                let activeId = "";
                sections.forEach(sec => {
                    if (scrollBox.scrollTop >= (sec.offsetTop - 160)) {
                        activeId = sec.getAttribute('id');
                    }
                });
                navItems.forEach(item => {
                    item.classList.remove('active-nav');
                    if (item.getAttribute('href') === `#${activeId}`) item.classList.add('active-nav');
                });
            });
        }

        function mountLazyIntersectionObservers() {
            const lazyFrames = document.querySelectorAll('.lazy-iframe');
            const observer = new IntersectionObserver((entries, obsRef) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const frame = entry.target;
                        if(frame.getAttribute('data-src') === "about:blank") return;

                        const container = frame.parentElement;
                        const loader = document.createElement('div');
                        loader.className = "absolute inset-0 bg-slate-900/90 flex flex-col justify-center items-center rounded-xl transition-opacity duration-500 z-10";
                        loader.innerHTML = '<div class="w-7 h-7 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin mb-2"></div><span class="text-[9px] text-gray-400 font-bold uppercase">डेटा ग्रिड लोड हो रहा है...</span>';
                        container.appendChild(loader);

                        frame.src = frame.getAttribute('data-src');
                        frame.onload = () => {
                            loader.classList.add('opacity-0');
                            setTimeout(() => loader.remove(), 400);
                        };
                        obsRef.unobserve(frame);
                    }
                });
            }, { root: document.getElementById('main-content-scroll-box'), rootMargin: '150px' });
            lazyFrames.forEach(f => observer.observe(f));
        }
    </script>
    <script>
        // Disable Right-Click (Context Menu) with User Alert Toast
window.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Right-click ko rokta hai
    triggerVibration([80, 50]); // Mobile par vibration alert dega
    showNetworkToastStream(
        "bg-rose-950 border-rose-800 text-rose-300", 
        "fa-solid fa-ban", 
        "सुरक्षा कारणों से राइट-क्लिक ब्लॉक है!"
    );
});

// Shortcut Keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U) ko block karne ke liye
window.addEventListener('keydown', (event) => {
    if (
        event.key === 'F12' || 
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i' || event.key === 'J' || event.key === 'j' || event.key === 'C' || event.key === 'c')) || 
        (event.ctrlKey && (event.key === 'U' || event.key === 'u'))
    ) {
        event.preventDefault();
        triggerVibration([80, 50]);
        showNetworkToastStream(
            "bg-rose-950 border-rose-800 text-rose-300", 
            "fa-solid fa-code", 
            "डेवलपर टूल्स एक्सेस वर्जित है!"
        );
    }
});

// Dropdown control trigger logic
function handleDistrictChange(districtValue) {
    const blockSelect = document.getElementById('form-block');
    
    // Default/Reset options clean state
    blockSelect.innerHTML = '<option value="">-- अंचल/ब्लॉक चुनें --</option>';
    
    // Agar condition 'सारण' (value="17") sach hoti hai to hi options generate hongi
    if (districtValue === "17") {
        const saranBlocks = [
            { val: "17", name: "अमनौर" },
            { val: "4",  name: "बनियापुर" },
            { val: "18", name: "दरियापुर" },
            { val: "19", name: "दिघवारा" },
            { val: "6",  name: "एकमा" },
            { val: "11", name: "गरखा" },
            { val: "15", name: "इसुवापुर" },
            { val: "7",  name: "जलालपुर" },
            { val: "5",  name: "लाहलादपुर" },
            { val: "9",  name: "मकेर" },
            { val: "3",  name: "मांझी" },
            { val: "12", name: "मरहौरा" },
            { val: "16", name: "मशरख" },
            { val: "8",  name: "नागरा" },
            { val: "13", name: "पनापुर" },
            { val: "10", name: "परसा" },
            { val: "2",  name: "रिविलगंज" },
            { val: "1",  name: "सारण सदर" },
            { val: "20", name: "सोनपुर" },
            { val: "14", name: "तरैया" }
        ];
        
        saranBlocks.forEach(block => {
            let opt = document.createElement('option');
            opt.value = block.val;
            opt.textContent = block.name;
            blockSelect.appendChild(opt);
        });
    } else {
        // Agar koi aur jila select kiya to block option reset hokar change selection dikhayega
        blockSelect.innerHTML = '<option value="">-- इस जिले के ब्लॉक उपलब्ध नहीं हैं --</option>';
    }
}

// FIX: Jab user details load ya append ho rhi hon (Submission Summary Box me)
// To id.value nikalne ki jagah niche diye gaye tareeqe se Text read karein:
function getSelectedDropdownText(elementId) {
    const dropdown = document.getElementById(elementId);
    if(dropdown && dropdown.selectedIndex >= 0) {
        return dropdown.options[dropdown.selectedIndex].text;
    }
    return "";
}


   
