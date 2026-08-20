document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'https://asigns-worker.jacksonneal09888.workers.dev';

    const bookDate = document.getElementById('bookDate');
    const bookSlots = document.getElementById('bookSlots');
    const bookForm = document.getElementById('bookForm');
    const bookSubmitBtn = document.getElementById('bookSubmitBtn');
    const bookFeedback = document.getElementById('bookFeedback');
    const bookSelectedSummary = document.getElementById('bookSelectedSummary');

    if (!bookDate || !bookForm) return;

    let selectedTime = null;

    function todayLocalISO() {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - offset * 60000);
        return local.toISOString().slice(0, 10);
    }

    function formatTime12h(hhmm) {
        const [h, m] = hhmm.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}:${String(m).padStart(2, '0')} ${period}`;
    }

    function formatDateLong(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
    }

    function updateSelectedSummary() {
        if (!selectedTime) {
            bookSelectedSummary.classList.add('hidden');
            bookSubmitBtn.disabled = true;
            bookSubmitBtn.textContent = window.t ? window.t('book.confirm') : 'Pick a time above to continue';
            return;
        }
        bookSelectedSummary.classList.remove('hidden');
        bookSelectedSummary.textContent = `${formatDateLong(bookDate.value)} at ${formatTime12h(selectedTime)}`;
        bookSubmitBtn.disabled = false;
        bookSubmitBtn.textContent = window.t ? window.t('book.confirmReady') : 'Confirm Appointment';
    }

    async function loadSlots() {
        selectedTime = null;
        updateSelectedSummary();
        bookSlots.innerHTML = '<p class="book-slots-empty">Loading available times…</p>';

        try {
            const res = await fetch(`${API_BASE}/api/availability?date=${bookDate.value}`);
            const data = await res.json();

            if (!res.ok) {
                bookSlots.innerHTML = `<p class="book-slots-empty">${data.error || 'Could not load times.'}</p>`;
                return;
            }

            if (data.closed) {
                bookSlots.innerHTML = '<p class="book-slots-empty">Closed for online booking that day — Sundays are by appointment only. Call or text 336-215-0518 to arrange a visit.</p>';
                return;
            }

            if (!data.slots.length) {
                bookSlots.innerHTML = '<p class="book-slots-empty">No more openings that day. Try another date.</p>';
                return;
            }

            bookSlots.innerHTML = '';
            data.slots.forEach((slot) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'book-slot' + (slot.available ? '' : ' is-booked');
                btn.textContent = formatTime12h(slot.time);
                btn.disabled = !slot.available;
                if (slot.available) {
                    btn.addEventListener('click', () => {
                        bookSlots.querySelectorAll('.book-slot').forEach((b) => b.classList.remove('is-selected'));
                        btn.classList.add('is-selected');
                        selectedTime = slot.time;
                        updateSelectedSummary();
                    });
                }
                bookSlots.appendChild(btn);
            });
        } catch (err) {
            bookSlots.innerHTML = '<p class="book-slots-empty">Something went wrong loading times — please call or text us at 336-215-0518 instead.</p>';
        }
    }

    bookDate.min = todayLocalISO();
    bookDate.value = todayLocalISO();
    bookDate.addEventListener('change', loadSlots);
    loadSlots();

    bookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (bookForm.dataset.submitting === '1') return;
        if (!selectedTime) return;

        bookForm.dataset.submitting = '1';
        bookSubmitBtn.disabled = true;

        const payload = {
            name: document.getElementById('bookName').value,
            email: document.getElementById('bookEmail').value,
            phone: document.getElementById('bookPhone').value,
            date: bookDate.value,
            time: selectedTime,
            notes: document.getElementById('bookNotes').value,
            honeypot: document.getElementById('bookHoneypot')?.value || '',
        };

        bookFeedback.textContent = 'Booking your appointment…';
        bookFeedback.classList.remove('hidden');

        try {
            const response = await fetch(`${API_BASE}/api/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Request failed');

            bookFeedback.textContent = `You're booked for ${formatDateLong(bookDate.value)} at ${formatTime12h(selectedTime)}. We'll see you then!`;
            bookForm.reset();
            selectedTime = null;
            updateSelectedSummary();
            loadSlots();
        } catch (error) {
            bookFeedback.textContent = error.message && error.message !== 'Request failed'
                ? error.message
                : 'Something went wrong booking that slot — please call or text us at 336-215-0518 instead.';
            bookSubmitBtn.disabled = !selectedTime;
        } finally {
            bookForm.dataset.submitting = '';
        }
    });
});
