var films = []; //массив, в котором хранятся все фильмы

var bookmarks = (localStorage.getItem('bookmarks__list')) ?
    JSON.parse(localStorage.getItem('bookmarks__list')) :
    {}; //объект, в котором хранятся все фильмы в закладках
var current_tags = {}; //текущие выбранные теги
var current_movies = {}; //текущие выбранные фильмы
var current_films_amount = 15; //количество фильмов изначально на странице

var tags = []; //массив, в котором хранятся все теги


$(function () {

    // получение данных json (фильмы)
    $.ajax({
        url : "./jsons/films.json",
        method : "get",
        success: function (data) {
            films = data;
            showFilms();

        },
        error : function () {
            console.log("error");
        }
    });

    //получение данных json (теги)
    $.ajax({
        url : "./jsons/tags.json",
        method : "get",
        success: function (data) {
            tags = data;
            showTags(tags);
        },
        error : function () {
            console.log("error");
        }
    });


//обработка клика по разделам фильмы/закладки
    $("body").on("click", '.header__link',function () {
        var $self = $(this); // получаем ссылку на тек объект клика
        setActive($self);
        showContent($self);
    });


//показ фильмов/закладок при клике на звезду1
    $("body").on('click', '.star__icon', function () {
        var $icon = $(this);
        var movie_title = $icon.closest('.film__item').find(".film__name").html();
        
        if (typeof bookmarks[movie_title] == 'undefined') {
            bookmarks[movie_title] = true;
            $icon.find('use').attr('href', '#star2');
        } else {
            delete bookmarks[movie_title];
            $icon.find('use').attr('href', '#star');
        }
        
        localStorage.setItem('bookmarks__list', JSON.stringify(bookmarks));
        
    });


//удаление списка закладок при клике на звезду2
    $("body").on('click', '.star2__icon', function () {
        var $icon = $(this);
        var movie_title = $icon.closest('.bookmarks__item').find(".bookmarks__name").html();
        delete bookmarks[movie_title];
        showBookmarks();
    });


//обработка клика по кнопке "Показать еще"
    $("body").on('click', '.content__more_container', function () {
        current_films_amount += 15;
        showFilms();
    });


//обработка клика по тегу
    $("body").on('click', '.tag', function () {
        var $self = $(this);
        var tag_name = $self.find('a').html();

        if ($self.hasClass('active')){
            $self.removeClass('active');
            delete current_tags[tag_name.toLowerCase()]
        } else {
            $self.addClass('active');
            current_tags[tag_name.toLowerCase()] = true;
        }

        if (jQuery.isEmptyObject(current_tags)) {
            showFilms();
            return;
        }

        $(".films__content").empty();
        for (var i = 0; i < films.length; i++) {
                for (var j = 0; j < films[i].tags.length; j++) {
                    var $selfElement = films[i].tags[j];
                    if (current_tags[$selfElement.toLowerCase()]){
                        var $element = createFilmItem();
                        current_movies[films[i].title.toLowerCase()] = true;
                        $element.find('.film__name').html(films[i].title);
                        if (bookmarks.hasOwnProperty(films[i].title) == true) {
                            $element.find('use').attr('href', '#star2');
                        }
                        $(".films__content").append($element);
                        break;
                    }
                }
        }
        $(".btn").addClass('closed');
    });
});


//живой поиск по названию
//функция поиска совпадений вводимых символов
function findEl(array, value) {
    //очищаем список совпадений
    $(".films__content").empty();
    for (var i = 0; i < array.length; i++){
        if (array[i].title.toLowerCase().indexOf(value.toLowerCase()) != -1){//проверяем каждый элемент на совпадение побуквенно
            var $element = createFilmItem();
            $element.find('.film__name').html(array[i].title);
            if (bookmarks.hasOwnProperty(array[i].title) == true) {
                $element.find('use').attr('href', '#star2');
            }
            $(".films__content").append($element);
        }
    }
    $(".btn").addClass('closed');
}

var filterInput = $('#filter');
//проверка при каждом вводе символа
filterInput.bind('input propertychange', function(){
    if($(this).val() !== ''){
        findEl(films, $(this).val());
    } else {
        showFilms();
    }
});


//показать кнопку
function showButton() {
    if (current_films_amount < films.length) {
        $(".content__more_container").addClass("showed");
    } else {
        $(".content__more_container").removeClass("showed");
    }
}


//она делает активной какую-то кнопку, снимает активность у всех
function setActive($btn) {
    $(".header__link").removeClass('active');
    $btn.addClass('active');
}


//показ/скрытие контента
function showContent($btn) {
    if ($btn.hasClass('films')) {
        $(".btn").removeClass("closed");
        $(".films__content").removeClass('closed');
        $('.bookmarks__content').addClass('closed');
        showFilms();

    } else {
        $(".btn").addClass("closed");
        $(".bookmarks__content").removeClass('closed');
        $('.films__content').addClass('closed');
        showBookmarks();
    }
}


//выводит переданный json(фильмы)
function showFilms() {
    $(".films__content").removeClass('closed');
    $(".films__content").empty();
    for (var i = 0; i < current_films_amount; i++) {
        var jsonElement = films[i];
        if (typeof jsonElement != "undefined"){
            var $element = createFilmItem();
            $element.find('.film__name').text(jsonElement.title);
            $(".films__content").append($element);

            if (bookmarks.hasOwnProperty(jsonElement.title) == true) {
                $element.find('use').attr('href', '#star2');
            }
        }
    }
    showButton();
}


//создает элемент фильма
function createFilmItem() {
    return $('<div class="film__item">\n' +
        '                            <div class="film__name"></div>\n' +
        '                            <div class="film__icon">\n' +
        '                                <svg class="star__icon">\n' +
        '                                    <use xlink:href="#star" class="star"></use>\n' +
        '                                </svg>\n' +
        '                            </div>\n' +
        '                        </div>');
}


//показ закладок
function showBookmarks() {
    $(".bookmarks__content").empty();
    for (var key in bookmarks) {
        var $element = createBookmarksItem();
        $element.find('.bookmarks__name').text(key);
        $(".bookmarks__content").append($element);
    }
}


//создает элемент закладки
function createBookmarksItem() {
    return $('<div class="bookmarks__item">\n' +
        '                                <div class="bookmarks__name"></div>\n' +
        '                                <div class="bookmarks__icon">\n' +
        '                                    <svg class="star2__icon">\n' +
        '                                        <use xlink:href="#star2"></use>\n' +
        '                                    </svg>\n' +
        '                                </div>\n' +
        '                            </div>');
}


//показ всех тегов
function showTags(json) {
    for (var i = 0; i < json.length; i++) {
        var jsonElem = json[i];
        var $elem = createTags();
        $elem.find('.tag__link').text(jsonElem);
        $(".tags__inner").append($elem);
    }
}


//создает элемент тега
function createTags() {
    return $('<div class="tag__item">' +
                '<span class="tag">' +
                    '<a href="#" class="tag__link"></a>' +
                '</span>' +
            '</div>');
}



