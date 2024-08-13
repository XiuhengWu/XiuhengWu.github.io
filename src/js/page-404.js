var torch = document.querySelector('.torch');
document.addEventListener('mousemove', function(event) {
    torch.style.top = event.pageY + 'px';
    torch.style.left = event.pageX + 'px';
});
console.log(location)
