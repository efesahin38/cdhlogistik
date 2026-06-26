// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu ul li a');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      const icon = hamburger.querySelector('i');
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    });
  });
}

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  const elementVisible = 100;

  revealElements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      el.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger once on load
revealOnScroll();

// Handle AJAX Form Submission with FormSubmit.co
const bookingForm = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const submitSpinner = document.getElementById('submitSpinner');
const btnText = submitBtn.querySelector('span');
const formMessage = document.getElementById('formMessage');
const formWrapper = document.getElementById('formWrapper');

if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get values
    const companyName = document.getElementById('companyName').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const containerSize = document.getElementById('containerSize').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Prepare data for FormSubmit.co
    const payload = {
      _subject: `Neue Buchungsanfrage: ${companyName} (${firstName} ${lastName})`,
      _replyto: email,
      Firma: companyName,
      Name: `${firstName} ${lastName}`,
      Email: email,
      Containergroesse: containerSize,
      Mietzeitraum_Von: startDate,
      Mietzeitraum_Bis: endDate,
      Nachricht: `Es gibt eine neue Buchungsanfrage von ${firstName} ${lastName} (${companyName}) für einen ${containerSize} Container.`
    };

    // Show loading state
    submitBtn.disabled = true;
    btnText.innerText = "SENDET...";
    submitSpinner.classList.remove('hidden');

    // Target email for form submissions
    const targetEmail = "Cdh-hamburg.de";

    fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      // Hide form, show success message
      formWrapper.classList.add('hidden');
      formMessage.classList.remove('hidden');
    })
    .catch(error => {
      console.error("Error submitting form:", error);
      alert("Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es später noch einmal.");
      // Reset button
      submitBtn.disabled = false;
      btnText.innerText = "ANFRAGE SENDEN";
      submitSpinner.classList.add('hidden');
    });
  });
}

// Initialize Flatpickr for Date Inputs
if (typeof flatpickr !== 'undefined') {
  flatpickr("#startDate", {
    locale: "de",
    dateFormat: "Y-m-d",
    minDate: "today",
    altInput: true,
    altFormat: "d.m.Y",
    placeholder: "Datum wählen"
  });

  flatpickr("#endDate", {
    locale: "de",
    dateFormat: "Y-m-d",
    minDate: "today",
    altInput: true,
    altFormat: "d.m.Y",
    placeholder: "Datum wählen"
  });
}
