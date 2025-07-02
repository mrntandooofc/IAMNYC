// Simulate loading time
setTimeout(() => {
 document.querySelector('.loading-screen').style.display = 'none';
 document.querySelector('.container').style.display = 'block';
}, 2000);

// Update loading screen text
document.querySelector('.loading-screen').innerHTML = `
 <div class="loader"></div>
 <h1>Mr Ntando Ofc</h1>
`;

// Add event listener to nav links
document.querySelectorAll('nav a').forEach((link) => {
 link.addEventListener('click', (e) => {
 e.preventDefault();
 const targetId = link.getAttribute('href');
 document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
 });
});
