(function () {
    var headlines = document.querySelector(".signees");
    var positionLeft = headlines.offsetLeft;
    var tickerMoves;

    function moveTicker() {
        var firstHeadline = document.querySelector(".signees > .signee");
        if (positionLeft + firstHeadline.offsetWidth <= 0) {
            headlines.append(firstHeadline);
            positionLeft = positionLeft + firstHeadline.offsetWidth;
            //positionLeft = 0 works as long as increment is 1, otherwise jumps
        }
        positionLeft -= 3;
        headlines.style.left = positionLeft + "px";
        tickerMoves = requestAnimationFrame(moveTicker);
    }

    moveTicker();

    headlines.addEventListener("mouseenter", function () {
        cancelAnimationFrame(tickerMoves);
    });

    headlines.addEventListener("mouseleave", function () {
        moveTicker();
    });
})();
