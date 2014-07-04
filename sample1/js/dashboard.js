
//Reference & Credits for animating grid with CSS3 transitions : http://blog.stevensanderson.com/2013/03/15/animating-lists-with-css-3-transitions/
//rest of it: https://twitter.com/jeetaz
var initialHeight;
var initialWidth;
var nCols = 0;
var nRows = 0;
var nWidgetCounts = 10;


$(function () {

    initialHeight = $(".container").height();
    initialWidth = $(".container").width();

    $(".items").sortable({
        containment: "parent",
        //scrollSensitivity: 100,
        //placeholder: 'placeholder',
        start: function (event, ui) {
            // Temporarily move the dragged item to the end of the list so that it doesn't offset the items
            // below it (jQuery UI adds a 'placeholder' element which creates the desired offset during dragging)
            $(ui.item).appendTo(this).addClass("dragging");
        },
        stop: function (event, ui) {
            // jQuery UI instantly moves the element to its final position, but we want it to transition there.
            // So, first convert the final top/left position into a translate3d style override
            var newTranslation = "translate3d(" + ui.position.left + "px, " + ui.position.top + "px, 0)";
            $(ui.item).css("-webkit-transform", newTranslation)
                        .css("transform", newTranslation);
            // ... then remove that override within a snapshot so that it transitions.
            $(ui.item).snapshotStyles().removeClass("dragging").releaseSnapshot();
        }
    });

    // Workaround for Webkit bug: force scroll height to be recomputed after the transition ends, not only when it starts
    $(".items").on("webkitTransitionEnd", function () {
        $(this).hide().offset();
        $(this).show();
    });

    function createListStyles(rulePattern, rows, cols, width, height) {
        $('#headstyle').remove();
        var rules = [], index = 0;
        for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (var colIndex = 0; colIndex < cols; colIndex++) {
                var x = (colIndex * 100) + "%",
                    y = (rowIndex * 100) + "%",
                    transforms = "{ -webkit-transform: translate3d(" + x + ", " + y + ", 0); transform: translate3d(" + x + ", " + y + ", 0); }";
                rules.push(rulePattern.replace("{0}", ++index) + transforms);
            }
        }
        if (width > 0 & height > 0) {
            $(".items li").css("width", width + 'px').css("height", height + 'px');
        }

        var headElem = document.getElementsByTagName("head")[0],
            styleElem = $("<style>").attr("type", "text/css").attr("id", "headstyle").appendTo(headElem)[0];
        if (styleElem.styleSheet) {
            styleElem.styleSheet.cssText = rules.join("\n");
        } else {
            styleElem.textContent = rules.join("\n");
        }
    }

    //calculate rows
    function calculateRowsCols(_minHeight, _minWidth) {
        //var cuttOffWidth = 768;
        //var cuttOffHeight = 450;
        var minHeight = _minHeight;
        var minWidth = _minWidth;
        var currentWidth = $('.items').width();
        var currentHeight = $('.items').height();
        nCols = Math.floor(parseInt(currentWidth) / parseInt(minWidth));
        nRows = Math.floor(parseInt(currentHeight) / parseInt(minHeight));

        if (nCols > 0 && nRows > 0) {
            if (nCols === 1) {
                var currentWidthPercentage = Math.max(Math.floor(parseInt(currentWidth) / parseInt(currentWidth)), 1) * 100;
                var liWidth = Math.floor(parseInt(currentWidthPercentage) / nCols);
                var currentHeightPercentage = Math.max(Math.floor(parseInt(currentHeight) / parseInt(currentHeight)), 1) * 100;
                var liHeight = Math.floor(parseInt(currentHeightPercentage) / nRows);
            }
            else {
                var currentWidthPercentage = Math.max(Math.floor(parseInt(initialWidth) / parseInt(currentWidth)), 1) * 100;
                var liWidth = Math.floor(parseInt(currentWidthPercentage) / nCols);
                var currentHeightPercentage = Math.max(Math.floor(parseInt(initialHeight) / parseInt(currentHeight)), 1) * 100;
                var liHeight = Math.floor(parseInt(currentHeightPercentage) / nRows);
            }

            var liWidthPixel = Math.floor(parseInt(currentWidth) * parseInt(liWidth) / 100);
            var liHeightPixel = Math.floor(parseInt(currentHeight) * parseInt(liHeight) / 100);

            createListStyles(".items li:nth-child({0})", nWidgetCounts / nCols, nCols, liWidthPixel, liHeightPixel);
        }
        else {
            var liWidthPixel = minWidth;
            var liHeightPixel = minHeight;
            createListStyles(".items li:nth-child({0})", nWidgetCounts, 1, liWidthPixel, liHeightPixel);
        }
        initialWidth = currentWidth;
        initialHeight = currentHeight;
    }

    //resize event handler using underscore debounce
    $(function () {
        var debounced_resizer_fn;
        debounced_resizer_fn = _.debounce(function () {
            var selectedValue = $('#layoutStyle').val().split('X');
            calculateRowsCols(parseInt(selectedValue[1]), parseInt(selectedValue[0]));
        }, 500);
        $(window).resize(debounced_resizer_fn);
    });

    //initial calcuate rows
    calculateRowsCols(250, 250);

    //onchange event dropdown
    $('#layoutStyle').change(function () {
        var selectedValue = $('#layoutStyle').val().split('X');
        calculateRowsCols(parseInt(selectedValue[1]), parseInt(selectedValue[0]));
    });
});

// Snapshotting utils
(function () {
    var stylesToSnapshot = ["transform", "-webkit-transform"];

    $.fn.snapshotStyles = function () {
        if (window.getComputedStyle) {
            $(this).each(function () {
                for (var i = 0; i < stylesToSnapshot.length; i++)
                    this.style[stylesToSnapshot[i]] = getComputedStyle(this)[stylesToSnapshot[i]];
            });
        }
        return this;
    };

    $.fn.releaseSnapshot = function () {
        $(this).each(function () {
            this.offsetHeight; // Force position to be recomputed before transition starts
            for (var i = 0; i < stylesToSnapshot.length; i++)
                this.style[stylesToSnapshot[i]] = "";
        });
    };
})();