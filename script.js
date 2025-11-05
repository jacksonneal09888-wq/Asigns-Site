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

        const addImageToCanvas = (dataUrl) => {
            fabric.Image.fromURL(dataUrl, (img) => {
                const canvasCenter = gangCanvas.getCenter();
                const maxWidth = gangCanvas.getWidth() * 0.8;
                const maxHeight = gangCanvas.getHeight() * 0.8;

                const scaleFactor = Math.min(
                    maxWidth / img.width,
                    maxHeight / img.height,
                    1
                );

                img.set({
                    left: canvasCenter.left,
                    top: canvasCenter.top,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scaleFactor,
                    scaleY: scaleFactor
                });

                gangCanvas.add(img);
                gangCanvas.setActiveObject(img);
                gangCanvas.requestRenderAll();
            }, { crossOrigin: 'anonymous' });
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
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    const result = loadEvent.target?.result;
                    if (typeof result === 'string') {
                        addImageToCanvas(result);
                    }
                };
                reader.readAsDataURL(file);
            });
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
});
