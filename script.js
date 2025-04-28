$(function () {
  // deklarasi variabel
  let currentTranslateX = 0;
  const $container = $('#contain-recipes');
  const $prevArrow = $('.prev');
  const $nextArrow = $('.next');
  // variabel card tiap resep
  const cardWidth = 250;
  const gap = 24;
  const itemWidth = cardWidth + gap;
  const cardsPerPage = 4;
  let totalContentWidth = 0;
  let visibleWidth = (cardWidth * cardsPerPage) + (gap * (cardsPerPage - 1));
  let $carouselDiv;
  displayRecipes('https://dummyjson.com/recipes'); //default awal

  // function untuk status aktif navigasi carousel
  function updateCarousel() {
    $carouselDiv.css('transform', `translateX(-${currentTranslateX}px)`);

    // arrow navigasi kiri
    if (currentTranslateX <= 0) {
      $prevArrow.addClass('disabled');
    } else {
      $prevArrow.removeClass('disabled');
    }

    // arrow navigasi kanan
    if (currentTranslateX >= totalContentWidth - visibleWidth) {
      $nextArrow.addClass('disabled');
    } else {
      $nextArrow.removeClass('disabled');
    }
  }

  // function untuk menampilkan resep sesuai menu yg dipilih
  function displayRecipes(url){
    $.ajax({
      url: url,
      method: 'GET',
      success: function(data) {
        currentTranslateX = 0;
        let res = data.recipes;
        $carouselDiv = $('<div class="carousel"></div>');
        // membuat card untuk tiap resep
        $.each(res, function (key, recipe) {
          const card = `
            <div class="card" data-id="${recipe.id}">
              <img src="${recipe.image}" height="auto" alt="foto masakan ${recipe.name}">
              <div class="level">
                <p>${recipe.difficulty}</p>
                <div class="rate">
                  <span class="material-symbols-outlined" style="color: yellow"> star </span>
                  <p>${recipe.rating}</p>
                </div>
              </div>
              <h3>${recipe.name}</h3>
            </div>
          `;
          $carouselDiv.append(card);
        });
  
        // memasukkan card ke container recipe
        $container.empty().append($carouselDiv);
  
        // hitung jumlah resep tiap kategori
        const itemCount = $carouselDiv.find('.card').length;
        // hitung total panjang konten (card+gap)
        totalContentWidth = (itemWidth * itemCount) + (Math.ceil(itemCount/4)-3)*gap + 12;

        // untuk menampilkan navigasi
        if (itemCount<5){
          $('.arrow').addClass('hidden');
          $('.carousel').css({
            'justify-content': 'center',
            'align-items': 'center'
          });
        }
        else {
          $('.arrow').removeClass('hidden');
          $('.carousel').css({
            'justify-content': '',
            'align-items': ''
          });
        }
  
        //panggil function updateCarousel
        updateCarousel();
  
        // navigasi ke kanan
        $nextArrow.off('click').click(function () {
          const remainingWidth = totalContentWidth - (currentTranslateX + visibleWidth);
          if (remainingWidth > 0) {
            if (remainingWidth >= visibleWidth) {
              currentTranslateX += visibleWidth + 2*gap;
            } else {
              currentTranslateX += remainingWidth;
            }
            updateCarousel();
          }
        });
  
        // navigasi ke kiri
        $prevArrow.off('click').click(function () {
          if (currentTranslateX > 0) {
            if (currentTranslateX >= visibleWidth) {
              currentTranslateX -= visibleWidth + 2*gap;
            } else {
              currentTranslateX = 0;
            }
            updateCarousel();
          }
        });

        // card resep di klik, akan tampil detailnya
        $carouselDiv.on('click', '.card', function() {
          const id = $(this).data('id');
          detailRecipe(id);
          $('.detail-modal').removeClass('hidden');
          $('.overlay').removeClass('hidden');
        });
      },
      error: function(error) {
        console.error('Terjadi kesalahan:', error);
        $container.html('<p>Gagal menampilkan resep.</p>');
      }
    });
  }

  // function untuk menampilkan detail resep tiap masakan
  // ambil id dari card yang dipilih
  function detailRecipe(id){
    $.ajax({
      url: `https://dummyjson.com/recipes/${id}`,
      method: 'GET',
      success: function(data) {
        // daftar bahan baku
        let ingredientsList = '<ul>';
        data.ingredients.forEach(function(ingredient) {
            ingredientsList += `<li>${ingredient}</li>`;
        });
        ingredientsList += '</ul>';

        // daftar petunjuk
        let instructionsList = '<ol>';
        data.instructions.forEach(function(instruction) {
            instructionsList += `<li>${instruction}</li>`;
        });
        instructionsList += '</ol>';

        // membuat detail resep
        const detailRecipe = `
            <div class="detail-recipe">
                <img src="${data.image}" height="auto" alt="foto masakan ${data.name}">
                <div class="desc">
                  <div class="title">
                    <h3>${data.name}</h3>
                    <span class="material-icons close" id="close" style="color: white"> close </span>
                  </div>
                  <div class="ing-inst">
                    <h4>Ingredients</h4>
                    ${ingredientsList}
                    <h4>Instructions</h4>
                    ${instructionsList}
                  </div>
                </div>
            </div>
        `;
        $('.detail-modal').empty().append(detailRecipe);

        // action tombol close
        $('#close').on('click', function() {
          $('.detail-modal').addClass('hidden');
          $('.overlay').addClass('hidden');
          $('.detail-modal').empty();
        });
      },
      error: function(error) {
        console.error('Terjadi kesalahan:', error);
        $('detail').html('<p>Gagal menampilkan detail resep.</p>');
      }
    });
  }

  // button untuk menampilkan daftar resep tiap kategori
  $(".recipe-btn").on("click", function () {
    const url = $(this).data("url");
    displayRecipes(url);
  });
});