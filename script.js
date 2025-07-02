// Simulate loading time
setTimeout(() => {
 document.querySelector('.loading-screen').style.display = 'none';
 document.querySelector('.container').style.display = 'block';
}, 4000); // Increased loading time to 4 seconds

// Add event listener to nav links
document.querySelectorAll('nav a').forEach((link) => {
 link.addEventListener('click', (e) => {
 e.preventDefault();
 const targetId = link.getAttribute('href');
 document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
 });
});
