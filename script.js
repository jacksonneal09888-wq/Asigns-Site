document.addEventListener('DOMContentLoaded', () => {
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptCookiesBtn = document.querySelector('.accept-cookies');

    // Check if cookie consent has been given
    if (!localStorage.getItem('cookieConsent')) {
        cookieConsent.style.display = 'flex';
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieConsent.style.display = 'none';
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Section scroll animations
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a'); // Select all nav links

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Keep observing for repeated animations if desired
            } else {
                // Optional: remove 'visible' class when out of view
                // entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Back to top button functionality
    const backToTopBtn = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile navigation toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const mobileNavLinks = document.querySelectorAll('.nav-links li'); // Renamed to avoid conflict

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

    // Animate Links
    mobileNavLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Close nav when a link is clicked (for smooth scrolling)
    mobileNavLinks.forEach(link => { // Use mobileNavLinks here
        link.addEventListener('click', (e) => {
            // Check if the clicked link is part of the dropdown toggle
            if (link.parentElement.classList.contains('dropdown')) { // Check parent for dropdown class
                e.preventDefault(); // Prevent immediate navigation
                const dropdownContent = link.querySelector('.dropdown-content'); // Get the dropdown content
                if (dropdownContent && dropdownContent.classList.contains('dropdown-content')) {
                    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
                }
            } else {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                document.querySelectorAll('.nav-links li').forEach(item => { // Select all li elements for animation reset
                    item.style.animation = ''; // Reset animation
                });
                // Close any open dropdowns when a non-dropdown link is clicked
                const openDropdowns = document.querySelectorAll('.dropdown-content');
                openDropdowns.forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.matches('.dropdown a')) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                if (dropdown.style.display === 'block') {
                    dropdown.style.display = 'none';
                }
            });
        }
    });

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-btn');
    const galleryImages = document.querySelectorAll('.gallery-section .gallery a');

    let slideIndex = 0;

    galleryImages.forEach((imgLink, index) => {
        imgLink.addEventListener('click', (e) => {
            e.preventDefault();
            lightbox.style.display = 'block';
            lightboxImg.src = imgLink.href;
            captionText.innerHTML = imgLink.dataset.title;
            slideIndex = index;
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                plusSlides(-1);
            } else if (e.key === 'ArrowRight') {
                plusSlides(1);
            } else if (e.key === 'Escape') {
                lightbox.style.display = 'none';
            }
        }
    });

    // Function to change slides
    window.plusSlides = (n) => {
        showSlides(slideIndex += n);
    };

    function showSlides(n) {
        const images = document.querySelectorAll('.gallery-section .gallery a');
        if (n >= images.length) { slideIndex = 0; }
        if (n < 0) { slideIndex = images.length - 1; }
        lightboxImg.src = images[slideIndex].href;
        captionText.innerHTML = images[slideIndex].dataset.title;
    }

    // File upload display name
    const projectFileInput = document.getElementById('projectFile');
    const fileNameSpan = document.getElementById('fileName');

    if (projectFileInput) {
        projectFileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
            } else {
                fileNameSpan.textContent = 'No file chosen';
            }
        });
    }

    // Gang sheet builder functionality
    const gangCanvasElement = document.getElementById('gangCanvas');

    if (gangCanvasElement && window.fabric) {
        const PX_PER_INCH = 25;
        const PRESET_SIZES = {
            '22x24': { width: 22, height: 24 },
            '22x36': { width: 22, height: 36 },
            '24x48': { width: 24, height: 48 }
        };
        let sheetSizeState = { width: 22, height: 24 };
        let currentZoom = 1;

        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#e94560';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.cornerSize = 12;
        fabric.Object.prototype.borderColor = '#1a1a2e';
        fabric.Object.prototype.borderScaleFactor = 2;

        const gangCanvas = new fabric.Canvas('gangCanvas', {
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true
        });

        const sheetSizeSelect = document.getElementById('sheetSize');
        const customSizeInputs = document.getElementById('customSizeInputs');
        const customWidthInput = document.getElementById('customWidth');
        const customHeightInput = document.getElementById('customHeight');
        const applyCustomSizeButton = document.getElementById('applyCustomSize');
        const canvasDimensionsLabel = document.getElementById('canvasDimensionsLabel');
        const artworkUploadInput = document.getElementById('artworkUpload');
        const addTextButton = document.getElementById('addTextButton');
        const textOptionsPanel = document.getElementById('textOptions');
        const textInputField = document.getElementById('textInput');
        const textColorInput = document.getElementById('textColor');
        const textSizeInput = document.getElementById('textSize');
        const applyTextChangesButton = document.getElementById('applyTextChanges');
        const duplicateButton = document.getElementById('duplicateObject');
        const deleteButton = document.getElementById('deleteObject');
        const bringForwardButton = document.getElementById('bringForward');
        const sendBackwardButton = document.getElementById('sendBackward');
        const quantityInput = document.getElementById('sheetQuantity');
        const notesInput = document.getElementById('finishingNotes');
        const downloadLayoutButton = document.getElementById('downloadLayout');
        const clearCanvasButton = document.getElementById('clearCanvas');
        const zoomInButton = document.getElementById('zoomIn');
        const zoomOutButton = document.getElementById('zoomOut');
        const zoomResetButton = document.getElementById('zoomReset');
        const orderForm = document.getElementById('orderRequestForm');
        const customerNameInput = document.getElementById('customerName');
        const customerEmailInput = document.getElementById('customerEmail');
        const customerPhoneInput = document.getElementById('customerPhone');
        const shipDateInput = document.getElementById('desiredShipDate');
        const orderFeedback = document.getElementById('orderFeedback');

        const updateCanvasDimensions = (widthInches, heightInches) => {
            const widthPixels = Math.round(widthInches * PX_PER_INCH);
            const heightPixels = Math.round(heightInches * PX_PER_INCH);

            gangCanvas.setWidth(widthPixels);
            gangCanvas.setHeight(heightPixels);

            gangCanvasElement.setAttribute('width', widthPixels);
            gangCanvasElement.setAttribute('height', heightPixels);

            gangCanvas.requestRenderAll();
            canvasDimensionsLabel.textContent = `${widthInches}" x ${heightInches}"`;
        };

        const applyPresetSize = (value) => {
            if (PRESET_SIZES[value]) {
                sheetSizeState = { ...PRESET_SIZES[value] };
                updateCanvasDimensions(sheetSizeState.width, sheetSizeState.height);
            }
        };

        const inchesFromPixels = (pixels) => (pixels / PX_PER_INCH);

        const MAX_FILE_SIZE_MB = 25;

        const addFileToCanvas = (file) => {
            if (!file) {
                return;
            }

            if (!file.type || !file.type.startsWith('image/')) {
                showOrderFeedback('Please upload an image file (PNG, JPG, or TIFF).', true);
                return;
            }

            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                showOrderFeedback(`The file ${file.name} is larger than ${MAX_FILE_SIZE_MB}MB. Please upload a smaller image.`, true);
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result;
                if (typeof result !== 'string') {
                    showOrderFeedback('We were unable to read that file. Please try again.', true);
                    return;
                }

                fabric.Image.fromURL(result, (fabricImage) => {
                    const canvasCenter = gangCanvas.getCenter();
                    const maxWidth = gangCanvas.getWidth() * 0.8;
                    const maxHeight = gangCanvas.getHeight() * 0.8;
                    const naturalWidth = fabricImage.width || maxWidth;
                    const naturalHeight = fabricImage.height || maxHeight;
                    const scaleFactor = Math.min(
                        maxWidth / naturalWidth,
                        maxHeight / naturalHeight,
                        1
                    );

                    fabricImage.set({
                        left: canvasCenter.left,
                        top: canvasCenter.top,
                        originX: 'center',
                        originY: 'center'
                    });

                    fabricImage.scale(scaleFactor);

                    gangCanvas.add(fabricImage);
                    gangCanvas.setActiveObject(fabricImage);
                    gangCanvas.requestRenderAll();
                    showOrderFeedback(`${file.name} added to your sheet.`, false);
                }, { crossOrigin: null });
            };

            reader.onerror = () => {
                showOrderFeedback(`We couldn't load ${file.name}. Please try a different file format.`, true);
            };

            reader.readAsDataURL(file);
        };

        const exportCanvasImage = (multiplier = 3) => {
            const active = gangCanvas.getActiveObject();
            gangCanvas.discardActiveObject();
            gangCanvas.requestRenderAll();
            const dataUrl = gangCanvas.toDataURL({
                format: 'png',
                multiplier
            });
            if (active) {
                gangCanvas.setActiveObject(active);
            }
            gangCanvas.requestRenderAll();
            return dataUrl;
        };

        const downloadCanvasImage = () => {
            const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
            const fileName = `Asigns_DTF_GangSheet_${sheetSizeState.width}x${sheetSizeState.height}_${timestamp}.png`;
            const dataUrl = exportCanvasImage(3);
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            return fileName;
        };

        const summarizeCanvasObjects = () => {
            const objects = gangCanvas.getObjects();
            if (!objects.length) {
                return 'No items placed on the sheet yet.';
            }

            return objects.map((obj, index) => {
                const bounds = obj.getBoundingRect(true, true);
                const widthIn = inchesFromPixels(bounds.width).toFixed(2);
                const heightIn = inchesFromPixels(bounds.height).toFixed(2);
                const posXIn = inchesFromPixels(bounds.left).toFixed(2);
                const posYIn = inchesFromPixels(bounds.top).toFixed(2);

                if (obj.type === 'i-text') {
                    return `${index + 1}. Text "${obj.text}" – ${widthIn}" x ${heightIn}" @ (${posXIn}", ${posYIn}")`;
                }
                return `${index + 1}. Artwork – ${widthIn}" x ${heightIn}" @ (${posXIn}", ${posYIn}")`;
            }).join('\n');
        };

        const buildOrderSummary = (name, email, phone, shipDate) => {
            const itemsSummary = summarizeCanvasObjects();
            const notes = notesInput.value.trim() || 'None';
            const quantity = quantityInput.value || '1';
            const shipDateText = shipDate ? shipDate : 'Not specified';
            const phoneText = phone ? phone : 'Not provided';

            return [
                'Asigns & Printing - DTF Gang Sheet Request',
                '',
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${phoneText}`,
                `Desired ship date: ${shipDateText}`,
                '',
                `Sheet size: ${sheetSizeState.width}" x ${sheetSizeState.height}"`,
                `Sheet quantity: ${quantity}`,
                '',
                'Special notes:',
                notes,
                '',
                'Layout items:',
                itemsSummary
            ].join('\n');
        };

        const showOrderFeedback = (message, isError = false) => {
            orderFeedback.textContent = message;
            orderFeedback.classList.remove('hidden');
            orderFeedback.style.background = isError ? 'rgba(233, 69, 96, 0.18)' : 'rgba(40, 167, 69, 0.12)';
        };

        // Initialize canvas to default size
        applyPresetSize('22x24');

        sheetSizeSelect.addEventListener('change', (event) => {
            const value = event.target.value;
            if (value === 'custom') {
                customSizeInputs.classList.remove('hidden');
                customWidthInput.focus();
            } else {
                customSizeInputs.classList.add('hidden');
                applyPresetSize(value);
            }
        });

        applyCustomSizeButton.addEventListener('click', (event) => {
            event.preventDefault();
            const widthValue = parseFloat(customWidthInput.value);
            const heightValue = parseFloat(customHeightInput.value);

            if (Number.isFinite(widthValue) && Number.isFinite(heightValue) && widthValue > 0 && heightValue > 0) {
                sheetSizeState = { width: widthValue, height: heightValue };
                updateCanvasDimensions(sheetSizeState.width, sheetSizeState.height);
            }
        });

        artworkUploadInput.addEventListener('change', (event) => {
            const files = Array.from(event.target.files || []);
            if (!files.length) {
                return;
            }
            files.forEach(addFileToCanvas);
            event.target.value = '';
        });

        addTextButton.addEventListener('click', () => {
            textOptionsPanel.classList.toggle('hidden');
            if (!textOptionsPanel.classList.contains('hidden')) {
                textInputField.focus();
            }
        });

        applyTextChangesButton.addEventListener('click', (event) => {
            event.preventDefault();
            const textValue = textInputField.value.trim() || 'Your Text';
            const fontSizeValue = parseInt(textSizeInput.value, 10) || 36;
            const fillColor = textColorInput.value || '#000000';
            const activeObject = gangCanvas.getActiveObject();

            if (activeObject && activeObject.type === 'i-text') {
                activeObject.set({
                    text: textValue,
                    fontSize: fontSizeValue,
                    fill: fillColor
                });
                gangCanvas.requestRenderAll();
            } else {
                const canvasCenter = gangCanvas.getCenter();
                const textObject = new fabric.IText(textValue, {
                    left: canvasCenter.left,
                    top: canvasCenter.top,
                    originX: 'center',
                    originY: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: fontSizeValue,
                    fill: fillColor,
                    editable: true
                });
                gangCanvas.add(textObject);
                gangCanvas.setActiveObject(textObject);
                gangCanvas.requestRenderAll();
            }
        });

        const syncTextControls = (activeObject) => {
            if (activeObject && activeObject.type === 'i-text') {
                textOptionsPanel.classList.remove('hidden');
                textInputField.value = activeObject.text || '';
                textColorInput.value = activeObject.fill || '#000000';
                textSizeInput.value = Math.round(activeObject.fontSize || 36);
            }
        };

        gangCanvas.on('selection:created', (event) => {
            const selected = event.selected && event.selected[0];
            syncTextControls(selected);
        });

        gangCanvas.on('selection:updated', (event) => {
            const selected = event.selected && event.selected[0];
            syncTextControls(selected);
        });

        gangCanvas.on('selection:cleared', () => {
            if (!textOptionsPanel.classList.contains('hidden')) {
                textOptionsPanel.classList.add('hidden');
            }
        });

        duplicateButton.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObject = gangCanvas.getActiveObject();
            if (!activeObject) {
                return;
            }

            activeObject.clone((cloned) => {
                cloned.set({
                    left: activeObject.left + 20,
                    top: activeObject.top + 20
                });
                gangCanvas.add(cloned);
                gangCanvas.setActiveObject(cloned);
                gangCanvas.requestRenderAll();
            });
        });

        deleteButton.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObjects = gangCanvas.getActiveObjects();
            if (!activeObjects.length) {
                return;
            }
            activeObjects.forEach((obj) => gangCanvas.remove(obj));
            gangCanvas.discardActiveObject();
            gangCanvas.requestRenderAll();
        });

        bringForwardButton.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObject = gangCanvas.getActiveObject();
            if (activeObject) {
                gangCanvas.bringForward(activeObject);
                gangCanvas.requestRenderAll();
            }
        });

        sendBackwardButton.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObject = gangCanvas.getActiveObject();
            if (activeObject) {
                gangCanvas.sendBackwards(activeObject);
                gangCanvas.requestRenderAll();
            }
        });

        zoomInButton.addEventListener('click', (event) => {
            event.preventDefault();
            const newZoom = Math.min(currentZoom + 0.1, 3);
            const center = gangCanvas.getCenter();
            gangCanvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
            currentZoom = newZoom;
        });

        zoomOutButton.addEventListener('click', (event) => {
            event.preventDefault();
            const newZoom = Math.max(currentZoom - 0.1, 0.5);
            const center = gangCanvas.getCenter();
            gangCanvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
            currentZoom = newZoom;
        });

        zoomResetButton.addEventListener('click', (event) => {
            event.preventDefault();
            currentZoom = 1;
            gangCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            gangCanvas.requestRenderAll();
        });

        clearCanvasButton.addEventListener('click', (event) => {
            event.preventDefault();
            const confirmation = window.confirm('Clear all items from the gang sheet?');
            if (confirmation) {
                const objects = gangCanvas.getObjects();
                objects.forEach((obj) => gangCanvas.remove(obj));
                gangCanvas.backgroundColor = '#ffffff';
                gangCanvas.requestRenderAll();
            }
        });

        downloadLayoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (!gangCanvas.getObjects().length) {
                showOrderFeedback('Add artwork or text to the sheet before downloading.', true);
                return;
            }
            const fileName = downloadCanvasImage();
            showOrderFeedback(`Layout downloaded as ${fileName}.`, false);
        });

        orderForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = customerNameInput.value.trim();
            const email = customerEmailInput.value.trim();
            const phone = customerPhoneInput.value.trim();
            const shipDate = shipDateInput.value;

            if (!name || !email) {
                showOrderFeedback('Please enter your name and email before sending your request.', true);
                return;
            }

            if (!gangCanvas.getObjects().length) {
                showOrderFeedback('Please add artwork or text to your sheet before sending your request.', true);
                return;
            }

            const fileName = downloadCanvasImage();
            const summary = buildOrderSummary(name, email, phone, shipDate);

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summary).catch(() => {});
            }

            const mailtoBody = encodeURIComponent(`${summary}\n\nAttachment: ${fileName}\n(Please include the downloaded PNG when you email us.)`);
            const mailtoLink = `mailto:orders@asignsprinting.com?subject=${encodeURIComponent('DTF Gang Sheet Order Request')}&body=${mailtoBody}`;

            window.location.href = mailtoLink;

            showOrderFeedback('Order summary copied. Your layout downloaded—attach it to the email that just opened. Thank you!', false);
        });
    }

    // FAQ accordion behaviour (single open at a time)
    const faqDetails = document.querySelectorAll('.faq-grid details');
    if (faqDetails.length) {
        faqDetails.forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    faqDetails.forEach(other => {
                        if (other !== detail) {
                            other.removeAttribute('open');
                        }
                    });
                }
            });
        });
    }

    // T-shirt designer functionality
    const teeCanvasElement = document.getElementById('teeCanvas');

    if (teeCanvasElement && window.fabric) {
        const TEE_MAX_FILE_MB = 20;
        const teeCanvas = new fabric.Canvas('teeCanvas', {
            backgroundColor: '#f8fafc',
            preserveObjectStacking: true,
            selection: true
        });

        const teeFeedback = document.getElementById('teeFeedback');
        const teeColorSwatches = document.querySelectorAll('.tee-color-swatch');
        const teeArtworkUpload = document.getElementById('teeArtworkUpload');
        const teeTextInput = document.getElementById('teeTextInput');
        const teeFontSelect = document.getElementById('teeFontSelect');
        const teeTextColor = document.getElementById('teeTextColor');
        const teeAddTextButton = document.getElementById('teeAddText');
        const teeBringForwardButton = document.getElementById('teeBringForward');
        const teeSendBackwardButton = document.getElementById('teeSendBackward');
        const teeDuplicateButton = document.getElementById('teeDuplicate');
        const teeDeleteButton = document.getElementById('teeDelete');
        const teeDownloadButton = document.getElementById('teeDownloadMockup');
        const teeResetButton = document.getElementById('teeResetCanvas');

        const setTeeFeedback = (message, isError = false) => {
            if (!teeFeedback) {
                return;
            }
            teeFeedback.textContent = message;
            teeFeedback.classList.remove('hidden');
            teeFeedback.style.background = isError ? 'rgba(233, 69, 96, 0.18)' : 'rgba(59, 130, 246, 0.14)';
        };

        const teeBasePath = new fabric.Path('M140 70 L200 70 L225 40 L235 40 L260 70 L320 70 L350 130 L320 150 L320 470 L140 470 L140 150 L110 130 Z', {
            fill: '#f6f6f6',
            selectable: false,
            evented: false,
            stroke: 'rgba(15, 23, 42, 0.15)',
            strokeWidth: 2
        });
        teeBasePath.set({ left: 230, top: 70, originX: 'center', originY: 'top' });
        teeCanvas.add(teeBasePath);
        teeCanvas.sendToBack(teeBasePath);

        const teePrintableArea = new fabric.Rect({
            left: teeCanvas.getWidth() / 2,
            top: teeCanvas.getHeight() / 2 + 20,
            width: 220,
            height: 260,
            originX: 'center',
            originY: 'center',
            stroke: 'rgba(148, 163, 184, 0.5)',
            strokeWidth: 1,
            strokeDashArray: [8, 6],
            fill: 'rgba(255, 255, 255, 0.01)',
            selectable: false,
            evented: false,
            excludeFromExport: true
        });

        teeCanvas.add(teePrintableArea);
        teeCanvas.bringToFront(teePrintableArea);

        const clampObjectToPrintableArea = (obj) => {
            const areaBounds = teePrintableArea.getBoundingRect(true, true);
            const objectBounds = obj.getBoundingRect(true, true);

            let deltaX = 0;
            let deltaY = 0;

            if (objectBounds.left < areaBounds.left) {
                deltaX = areaBounds.left - objectBounds.left;
            }
            if (objectBounds.top < areaBounds.top) {
                deltaY = areaBounds.top - objectBounds.top;
            }
            if (objectBounds.left + objectBounds.width > areaBounds.left + areaBounds.width) {
                deltaX = (areaBounds.left + areaBounds.width) - (objectBounds.left + objectBounds.width);
            }
            if (objectBounds.top + objectBounds.height > areaBounds.top + areaBounds.height) {
                deltaY = (areaBounds.top + areaBounds.height) - (objectBounds.top + objectBounds.height);
            }

            if (deltaX || deltaY) {
                obj.left += deltaX;
                obj.top += deltaY;
                obj.setCoords();
            }
        };

        teeCanvas.on('object:moving', (event) => {
            clampObjectToPrintableArea(event.target);
        });

        teeCanvas.on('object:scaling', (event) => {
            clampObjectToPrintableArea(event.target);
        });

        const centerWithinPrintableArea = (object) => {
            object.set({
                originX: 'center',
                originY: 'center',
                left: teePrintableArea.left,
                top: teePrintableArea.top
            });
            clampObjectToPrintableArea(object);
            teeCanvas.add(object);
            teeCanvas.setActiveObject(object);
            teeCanvas.bringToFront(teePrintableArea);
            teeCanvas.requestRenderAll();
        };

        teeCanvas.on('object:added', (event) => {
            if (event.target !== teePrintableArea) {
                teeCanvas.bringToFront(teePrintableArea);
            }
        });

        const addFileToTeeCanvas = (file) => {
            if (!file || !file.type.startsWith('image/')) {
                setTeeFeedback('Please upload image files (PNG or JPG).', true);
                return;
            }

            if (file.size > TEE_MAX_FILE_MB * 1024 * 1024) {
                setTeeFeedback(`${file.name} is larger than ${TEE_MAX_FILE_MB}MB. Please upload a smaller file.`, true);
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result;
                if (typeof result !== 'string') {
                    setTeeFeedback('We were unable to read that file. Please try again.', true);
                    return;
                }

                fabric.Image.fromURL(result, (fabricImage) => {
                    const maxWidth = teePrintableArea.width * 0.9;
                    const maxHeight = teePrintableArea.height * 0.9;
                    const naturalWidth = fabricImage.width || maxWidth;
                    const naturalHeight = fabricImage.height || maxHeight;
                    const scaleFactor = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);

                    fabricImage.scale(scaleFactor);
                    centerWithinPrintableArea(fabricImage);
                    setTeeFeedback(`${file.name} added to your mockup.`, false);
                }, { crossOrigin: null });
            };

            reader.onerror = () => {
                setTeeFeedback(`We couldn't load ${file.name}. Try a different image.`, true);
            };

            reader.readAsDataURL(file);
        };

        teeColorSwatches.forEach((swatch) => {
            if (swatch.dataset.color) {
                swatch.style.backgroundColor = swatch.dataset.color;
            }
            swatch.addEventListener('click', () => {
                teeColorSwatches.forEach((s) => s.classList.remove('is-active'));
                swatch.classList.add('is-active');
                const color = swatch.dataset.color || '#f6f6f6';
                teeBasePath.set('fill', color);
                teeCanvas.requestRenderAll();
            });
        });

        if (!teeColorSwatches.length) {
            teeBasePath.set('fill', '#f6f6f6');
        }

        teeArtworkUpload?.addEventListener('change', (event) => {
            const files = Array.from(event.target.files || []);
            if (!files.length) {
                return;
            }
            files.forEach(addFileToTeeCanvas);
            event.target.value = '';
        });

        const syncTeeTextControls = (object) => {
            if (object && object.type === 'i-text') {
                teeTextInput.value = object.text || '';
                teeTextColor.value = typeof object.fill === 'string' ? object.fill : '#111827';
                teeFontSelect.value = object.fontFamily || 'Poppins';
            }
        };

        teeCanvas.on('selection:created', (event) => {
            syncTeeTextControls(event.selected && event.selected[0]);
        });

        teeCanvas.on('selection:updated', (event) => {
            syncTeeTextControls(event.selected && event.selected[0]);
        });

        teeCanvas.on('selection:cleared', () => {
            teeTextInput.value = '';
        });

        teeAddTextButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const textValue = teeTextInput.value.trim() || 'Your Text';
            const fontFamily = teeFontSelect.value || 'Poppins';
            const fillColor = teeTextColor.value || '#111827';
            const activeObject = teeCanvas.getActiveObject();

            if (activeObject && activeObject.type === 'i-text') {
                activeObject.set({
                    text: textValue,
                    fontFamily,
                    fill: fillColor
                });
                teeCanvas.requestRenderAll();
                setTeeFeedback('Text updated.', false);
                return;
            }

            const newText = new fabric.IText(textValue, {
                fontFamily,
                fill: fillColor,
                fontSize: 42,
                fontWeight: 600
            });

            centerWithinPrintableArea(newText);
            setTeeFeedback('Text added to the design.', false);
        });

        teeDuplicateButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObject = teeCanvas.getActiveObject();
            if (!activeObject) {
                return;
            }
            activeObject.clone((cloned) => {
                cloned.set({ left: activeObject.left + 20, top: activeObject.top + 20 });
                teeCanvas.add(cloned);
                teeCanvas.setActiveObject(cloned);
                teeCanvas.requestRenderAll();
            });
        });

        teeDeleteButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObjects = teeCanvas.getActiveObjects();
            if (!activeObjects.length) {
                return;
            }
            activeObjects.forEach((object) => {
                if (object !== teeBasePath && object !== teePrintableArea) {
                    teeCanvas.remove(object);
                }
            });
            teeCanvas.discardActiveObject();
            teeCanvas.requestRenderAll();
        });

        teeBringForwardButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObject = teeCanvas.getActiveObject();
            if (activeObject && activeObject !== teeBasePath) {
                teeCanvas.bringForward(activeObject);
                teeCanvas.requestRenderAll();
            }
        });

        teeSendBackwardButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const activeObject = teeCanvas.getActiveObject();
            if (activeObject && activeObject !== teeBasePath) {
                teeCanvas.sendBackwards(activeObject);
                teeCanvas.requestRenderAll();
            }
        });

        teeResetButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const objects = teeCanvas.getObjects();
            objects.forEach((object) => {
                if (object !== teeBasePath && object !== teePrintableArea) {
                    teeCanvas.remove(object);
                }
            });
            teeCanvas.discardActiveObject();
            teeCanvas.requestRenderAll();
            setTeeFeedback('Canvas cleared. Start fresh!', false);
        });

        teeDownloadButton?.addEventListener('click', (event) => {
            event.preventDefault();
            const hasDesign = teeCanvas.getObjects().some((object) => object !== teeBasePath && object !== teePrintableArea);
            if (!hasDesign) {
                setTeeFeedback('Add artwork or text before downloading.', true);
                return;
            }

            const previousOpacity = teePrintableArea.opacity;
            teePrintableArea.set('opacity', 0);
            teeCanvas.requestRenderAll();

            const dataUrl = teeCanvas.toDataURL({ format: 'png', multiplier: 2 });
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
            link.href = dataUrl;
            link.download = `Asigns_Tee_Mockup_${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            teePrintableArea.set('opacity', previousOpacity);
            teeCanvas.requestRenderAll();
            setTeeFeedback('Mockup downloaded. Ready to share!', false);
        });
    }
});
