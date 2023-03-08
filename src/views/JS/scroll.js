var scrollPosition = [0,0,0,0,0]
var cardWidth = $('.carousel-item').width()
var carouselWidth = $('.carousel-inner')[0].scrollWidth

function scrollNext (index) {
    event.preventDefault()

    if(scrollPosition[index] < (carouselWidth - (cardWidth * 8))) {
        scrollPosition[index] += (cardWidth * 4)
       
        $(`#scroll-${index}`).animate({scrollLeft: scrollPosition[index]}, 600)
    }
}

function scrollPrev (index) {
    event.preventDefault()

    if(scrollPosition[index] > 0) {
        scrollPosition[index] -= (cardWidth * 4)

        $(`#scroll-${index}`).animate({scrollLeft: scrollPosition[index]}, 600)
    }
}