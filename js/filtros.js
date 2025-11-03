const fulImgBox = document.getElementById("fulImgBox"),
fulImg = document.getElementById("fulImg");

function openFulImg(reference){
    fulImgBox.style.display = "flex";
    fulImg.src = reference
}
function closeImg(){
    fulImgBox.style.display = "none";
}


document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('#category-filter li');
    const images = document.querySelectorAll('.img-gallery img');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            images.forEach(img => {
                // Si la categoría es 'todos', muestra todas las imágenes
                if (filter === 'todos') {
                    img.style.display = 'block';
                } else {
                    // Si la imagen coincide con la categoría seleccionada, mostrarla, sino ocultarla
                    if (img.getAttribute('data-category') === filter) {
                        img.style.display = 'block';
                    } else {
                        img.style.display = 'none';
                    }
                }
            });
        });
    });
});