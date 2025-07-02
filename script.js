document.addEventListener('DOMContentLoaded', function() {
 const sections = document.querySelectorAll('section');

 const observer = new IntersectionObserver((entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 entry.target.classList.add('animate-in');
 }
 });
 }, {
 threshold: 0.5
 });

 sections.forEach((section) => {
 observer.observe(section);
 });

 const buttons = document.querySelectorAll('button');

 buttons.forEach((button) => {
 button.addEventListener('click', function() {
 console.log('Button clicked:', button.textContent);
 // Add more functionality here
 });
 });
});
