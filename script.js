window.onload = () => {
    var anim = document.getElementById('anim');
    anim.onmouseenter = () => {
        anim.src = "assets/animator2.png";
    }
    anim.onmouseleave = () => {
        anim.src = "assets/animator1.png";
    }
    console.log('suh');
}
