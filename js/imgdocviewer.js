/*jslint browser: true, eqeq: true, evil: true*/
/*global $, jQuery*/
/*!
 * ImageViewer Javascript Library v0.0.1
 *
 * Date: 2015-03-20
 * Author: CACS
 */

function ImageViewer(opts) {
    'use strict';
    var i, divSidebar, divOptions, divDoclist, imgDoclist, divIndex, imgIndex,
        divThumbnails, divThumbpanel, divDocPanel, divPagePanel, divPages, divStatusBar,
        divCtrlPage, divPrev, imgPrev, divCurrPage, txtCurrPage, divNext, imgNext,
        divCtrlZoom, divZoomOut, imgZoomOut, divZoom, txtZoom, divZoomIn, imgZoomIn,
        that = this,
        zoomScale = 100,
        currPage = 1,
        lastPage = opts.imgslist.length,
        imgTemp, thumbTemp, factor,
        xmlns = 'http://www.w3.org/2000/svg',
        page = [],
        svg = [],
        image = [],
        thumbnail = [],
        imgThumbnail = [],
        divLabel = [],
        spanLabel = [],
        maxWidth = 0,
        settings = $.extend({
            sidebar: false,
            thumbnails: false,
            bookmarks: false,
            statusbar: false
        }, opts);

    /** Create viewer's elements  **/
    if (settings.sidebar) {
        divOptions = document.createElement('div');
        divOptions.setAttribute('class', 'options');

        if (settings.thumbnails) {
            imgDoclist = document.createElement('img');
            imgDoclist.src = 'icons/thumbs.svg';

            divDoclist = document.createElement('div');
            divDoclist.setAttribute('class', 'option active');
            divDoclist.appendChild(imgDoclist);

            divOptions.appendChild(divDoclist);

            divThumbpanel = document.createElement('div');
            divThumbpanel.setAttribute('class', 'thumbpanel');

            divThumbnails = document.createElement('div');
            divThumbnails.setAttribute('class', 'thumbnails');
            divThumbnails.appendChild(divThumbpanel);
        }

        if (settings.bookmarks) {
            imgIndex = document.createElement('img');
            imgIndex.src = 'icons/toc.svg';

            divIndex = document.createElement('div');
            divIndex.setAttribute('class', 'option');
            divIndex.appendChild(imgIndex);

            divOptions.appendChild(divIndex);
        }

        divSidebar = document.createElement('div');
        divSidebar.setAttribute('class', 'sidebar');
        divSidebar.appendChild(divOptions);

        if (settings.thumbnails) {
            divSidebar.appendChild(divThumbnails);
        }
    }

    divPages = document.createElement('div');
    divPages.setAttribute('class', 'pages');

    divPagePanel = document.createElement('div');
    divPagePanel.setAttribute('class', 'pagePanel');
    divPagePanel.appendChild(divPages);

    if (settings.statusbar) {
        imgPrev = document.createElement('img');
        imgPrev.src = 'icons/left.svg';

        divPrev = document.createElement('div');
        divPrev.setAttribute('class', 'btnPage prev');
        divPrev.appendChild(imgPrev);

        txtCurrPage = document.createElement('input');
        txtCurrPage.setAttribute('class', 'currPage');
        txtCurrPage.setAttribute('type', 'text');
        txtCurrPage.setAttribute('value', '1 / ' + settings.imgslist.length);

        divCurrPage = document.createElement('div');
        divCurrPage.setAttribute('class', 'btnPage');
        divCurrPage.appendChild(txtCurrPage);

        imgNext = document.createElement('img');
        imgNext.src = 'icons/right.svg';

        divNext = document.createElement('div');
        divNext.setAttribute('class', 'btnPage next');
        divNext.appendChild(imgNext);

        divCtrlPage = document.createElement('div');
        divCtrlPage.setAttribute('class', 'ctrlPage');
        divCtrlPage.appendChild(divPrev);
        divCtrlPage.appendChild(divCurrPage);
        divCtrlPage.appendChild(divNext);

        imgZoomOut = document.createElement('img');
        imgZoomOut.src = 'icons/zoomOut.svg';

        divZoomOut = document.createElement('div');
        divZoomOut.setAttribute('class', 'btnZoom zoomOut');
        divZoomOut.appendChild(imgZoomOut);

        txtZoom = document.createElement('span');
        txtZoom.setAttribute('class', 'zoom');
        //txtZoom.setAttribute('id', 'zoom');
        txtZoom.innerHTML = '100%';

        divZoom = document.createElement('div');
        divZoom.setAttribute('class', 'txtZoom');
        divZoom.appendChild(txtZoom);

        imgZoomIn = document.createElement('img');
        imgZoomIn.src = 'icons/zoomIn.svg';

        divZoomIn = document.createElement('div');
        divZoomIn.setAttribute('class', 'btnZoom zoomIn');
        divZoomIn.appendChild(imgZoomIn);

        divCtrlZoom = document.createElement('div');
        divCtrlZoom.setAttribute('class', 'ctrlZoom');
        divCtrlZoom.appendChild(divZoomOut);
        divCtrlZoom.appendChild(divZoom);
        divCtrlZoom.appendChild(divZoomIn);

        divStatusBar = document.createElement('div');
        divStatusBar = document.createElement('div');
        divStatusBar.setAttribute('class', 'statusBar');
        divStatusBar.appendChild(divCtrlPage);
        divStatusBar.appendChild(divCtrlZoom);
    }

    divDocPanel = document.createElement('div');
    divDocPanel.setAttribute('class', 'docPanel');
    divDocPanel.appendChild(divPagePanel);

    if (settings.statusbar) {
        divDocPanel.appendChild(divStatusBar);
    }

    this.mainPanel = document.createElement('div');
    this.mainPanel.setAttribute('class', 'viewerPanel');

    if (settings.sidebar) {
        this.mainPanel.appendChild(divSidebar);
    }

    this.mainPanel.appendChild(divDocPanel);

    /*** Draw viewer ***/
    if (settings.parent != null) {
        $(settings.parent).append(that.mainPanel);
    }

    /** Private functions **/
    function scrollPages(e) {
        var scrollMiddle = (e.target.scrollTop + e.target.clientHeight) * 2,
            numberPage = 0;

        $('.page', divPages).each(function () {
            if (scrollMiddle > this.offsetTop) {
                var idx = this.getAttribute('idx'),
                    page = this,
                    imgTemp;

                numberPage = parseInt(idx, 10);

                if ($(this).hasClass('preload')) {
                    $(this).removeClass('preload');
                    imgTemp = new Image();
                    imgTemp.onload = function () {
                        $('image', page).fadeOut(200, function () {
                            this.setAttributeNS('http://www.w3.org/1999/xlink', 'href', settings.imgslist[idx].urlImg);
                            $(this).fadeIn(200);
                        });
                    };
                    imgTemp.src = settings.imgslist[idx].urlImg;
                }
            }
        });

        currPage = numberPage + 1;
        $(txtCurrPage).val(currPage + ' / ' + lastPage);
    }

    function scrollThumbnails(e) {
        var scrollBottom = (e.target.scrollTop + e.target.clientHeight) * 2;

        $('.thumbnail img.preload', divThumbpanel).each(function () {
            var idx = this.getAttribute('idx'),
                thumbImg = this,
                thumbTemp = new Image();

            if (scrollBottom > this.offsetTop) {
                $(this).removeClass('preload');

                thumbTemp.onload = function () {
                    $(thumbImg).fadeOut(200, function () {
                        this.src = thumbTemp.src;
                        $(this).fadeIn(200);
                    });
                };
                thumbTemp.src = settings.imgslist[idx].urlImg;
            }
        });
    }

    function clickOnThumbnail(e) {
        var idx = e.target.getAttribute('idx');

        $(divPagePanel).off('scroll', scrollPages);

        $(divPagePanel).animate({
            scrollTop: $('#page_' + idx, divPages)[0].offsetTop
        }, 400, function () {
            setTimeout(function () {
                $(divPagePanel).scroll(scrollPages);
                $(divPagePanel).trigger('scroll');
            }, 100);
        });
    }

    function toggleThumbnails() {
        $(divThumbnails).toggle('blind', {
            direction: 'left',
            duration: 300
        }, function () {
            if ($(divThumbnails).is(':hidden')) {
                $(divDoclist).removeClass('active');
            }
        });
    }

    function turnPage(dir) {
        if (dir == 'prev') {
            if (currPage == 1) {
                return;
            }
            currPage -= 1;
        } else if (dir == 'next') {
            if (currPage == lastPage) {
                return;
            }
            currPage += 1;
        }

        $(divPagePanel).stop().animate({
            scrollTop: $('#page_' + (currPage - 1), divPages)[0].offsetTop
        }, 400, function () {
            $(txtCurrPage).val(currPage + ' / ' + lastPage);
        });
    }

    function loadImages() {
        /*** Get the greatest width of list images ***/
        for (i = 0; i < settings.imgslist.length; i += 1) {
            if (settings.imgslist[i].width > maxWidth) {
                maxWidth = settings.imgslist[i].width;
            }
        }

        factor = (divPagePanel.clientWidth - 50) / maxWidth;

        for (i = 0; i < settings.imgslist.length; i += 1) {
            /*** Create thumbnails ***/
            if (settings.sidebar && settings.thumbnails) {
                spanLabel[i] = document.createElement('span');
                spanLabel[i].innerHTML = i + 1;

                divLabel[i] = document.createElement('div');
                divLabel[i].setAttribute('class', 'label');
                divLabel[i].appendChild(spanLabel[i]);

                imgThumbnail[i] = document.createElement('img');
                imgThumbnail[i].setAttribute('class', 'preload');
                imgThumbnail[i].setAttribute('idx', i);
                imgThumbnail[i].src = 'data:image/png;base64,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\nbCxgP6Ojo64bsatXr8Lv9wfcnE05k/0vZaoYGBhgZWUlx8bGnLXy8nJ6PB7u3LlzEncmpKEz6p+t\npqYGd911F3w+H1JTU9Hd3Y0zZ87gwQcfxEcfffS7ZzX5/1Go/+Dbb7/FV199hY6ODsycORN5eXnI\nzc2d7G0JFKoYMaWfo4pMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSF\nKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYo\nVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFB\noYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJ\nClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVM\nUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhigkIVExSqmKBQxQSFKiYoVDFBoYoJClVMUKhi\ngkIVExSqmPA3lU/xMjEYr2MAAAAASUVORK5CYII=';

                thumbnail[i] = document.createElement('div');
                thumbnail[i].setAttribute('class', 'thumbnail');
                thumbnail[i].setAttribute('idx', i);
                thumbnail[i].onclick = clickOnThumbnail;
                thumbnail[i].appendChild(imgThumbnail[i]);
                thumbnail[i].appendChild(divLabel[i]);

                divThumbpanel.appendChild(thumbnail[i]);

                if (imgThumbnail[i].offsetTop < divThumbnails.clientHeight) {
                    $(divThumbnails).trigger('scroll');
                }
            }

            /*** Create pages ***/
            image[i] = document.createElementNS(xmlns, 'image');
            image[i].setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAG4CAYAAAAaFB9MAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz\nAAA3XQAAN10BGYBGXQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABYtSURB\nVHic7d15cNT1/cfx1+YiBxIgkFgD2AmHFIoENoCUoUMhtSDlbq2lHZ3WghVwii3MwBSLWIbCWCtW\nCkqpOtUBqUg7RS1NKa3JFHMZ7ChEhks5YiAhcpiDI/v+/dEh0/3tblB5V2J8Pv78fvfz/X42mTz5\n7vdYAmZmAgBctbhrPQEAaC8IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGo\nAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKA\nE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4I\nKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA\n4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoAT\nggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggq\nADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADg\nhKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOC\nCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoA\nOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCE\noAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IK\nAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4\nIagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISg\nAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoA\nTggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADgh\nqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4SbjWE8BH19jYqMrKStXV1SkuLk49evRQ\n3759FQgErvXUgM80jlA/RQoKCjRhwgSlp6crGAzqq1/9qsaNG6ebbrpJN9xwgx588EE1NjZe62m2\nS3v27FEgENATTzxxraeCNowj1E+B8+fP695779XTTz+tjh076tvf/rYmTJigHj16KCkpSZWVldqw\nYYOWLVumF154QX/72990ww03XOtptyvFxcWSpBEjRlzjmaBNM7RpFy5csFtvvdUk2YQJE+z48eNR\nXxcKhWzZsmUmyYYNG2aXLl36hGfavt19992WmppqFy9evNZTQRvGR/42bsGCBSooKNCUKVO0bdu2\nmEeegUBAP/vZz/SNb3xDZWVl+sMf/vAJz7R9e+211xQMBpWQwIc6xEZQ27Dy8nKtWbNGvXv31saN\nGxUfH3/FMUuWLJEkbd68udXXXbp0STU1NWpubv7I8/rggw908eLFVl/T1NSkmpoamdlH3r4k1dXV\nXdX54Pfff18XLlz4SGPMTDU1NRHv7fTp03r77bev+HH/3LlzV/We8elHUNuwVatWKRQKafXq1UpN\nTf1QYwYPHqw77rhDAwYMiFh36tQpLViwQL1791ZKSooyMzOVnJysQYMG6Ve/+pUaGhqibnPp0qWa\nMWOGTpw4oYkTJ6pTp05KT0/XokWLFAqFWl73wQcf6MEHH1S/fv1atp+SkqJvfetbOnDggCRp+fLl\nGj16dNg46T8xe/bZZzVq1CilpaUpIyNDqampyszM1A9/+ENVVlZGnduOHTuUl5en3bt369y5c1q0\naJGuv/56de3aVampqRozZowqKipi/rwuXLigp556SsOGDQub81e+8hUVFRVJkkpKShQKhaIGtaqq\nSnPmzFH37t3VqVMnZWZmqmvXrrr77rtVVVUVc79op67tGQfEcvbsWUtKSrIBAwa4bG///v3Ws2dP\ny8nJsbVr11pJSYlVVlbaP//5T1u4cKElJydbXl6eNTY2RowdNGiQTZ061QYNGmQzZ860ZcuW2ciR\nI23atGktr9mzZ4/16tXLsrKy7JFHHrE333zTDh8+bC+99JKNGTPGMjIy7M0337S8vDz70pe+FLb9\n5uZmmzlzpnXo0MHuu+8+27lzp+3bt89KSkps/fr11r9/f0tOTraioqKIuS1evNgCgYCVlJRY7969\nbciQIbZixQr77W9/a/Pnz7eUlBTr1KmTVVdXR4ytqamxUaNG2XXXXWdLly61119/3Y4fP25lZWV2\n7733WlJSkm3ZssWWLl1qkuzo0aNh4wsLC61Lly6WmZlpq1atstLSUquoqLDVq1dbt27dLDs7244c\nOfJxf2X4FCKobdSf/vQnk2SrVq1y2d4tt9xi/fv3t5qamqjr169fb5Ls+eefD1t+7tw5i4+Pt65d\nu9pvfvObluWhUMjq6+vNzOzIkSOWmZlpubm5dvLkyajb//GPf2yDBw+2pKQku//++8PWPfHEExYI\nBGzbtm1Rx544ccI6d+5s48ePj1g3duxYS09PtxtvvNGWL19uzc3NYevXrl1rkux3v/td2PLz589b\nbm6u9ezZ0w4ePBh1v48++qh16dLFhg4datnZ2WHrDhw4YF26dLG+fftGvVD473//2xITE23SpElR\nt432iaC2UXPnzjVJ9tprr131toqLi61bt2724osvxnzNkSNHTJKtXLkybPk//vEPk2SjR4+OOTY/\nP98yMjKsqqoq5msaGxutU6dOEdFubm62kSNH2owZM1p9D+PGjbP+/fuHLWtubm7Z5vz586OOe+ut\nt0ySPfzww2HLlyxZYgkJCVZeXh5zn6FQyAYMGGCSbPr06WHrxo8fb2lpafbWW2/FHD979mwLBAJR\nj47RPnEOtY06dOiQJCk3N/eqtzVixAjV1NRo+vTpMV9TV1cnSerRo0fY8tLSUknSwoULo44rKirS\njh07tHz5cn3uc5+Luf3k5GQNHjy4ZT6XxcXFadeuXdqyZUur7+HUqVPq2bNn2LK9e/fq7Nmz6tWr\nl37xi19EHVdbWytJYXdHnDlzRo888oh+8IMfKBgMxtxnIBDQ2LFjI+a8e/dubd++XbNmzdLAgQNj\njr/11ltlZtq9e3er7w3tB/eAtFFVVVVKS0tTcnLy/2T7TU1Nqq2tVU1NjQ4cONBym9XNN98c9rrS\n0lKlpKRo3LhxUbfz7LPPqmPHjrrzzjuvuM+4uDhlZWXp85//fKuvC4VCqq2tVW1trd577z2VlZWp\nsrIyYg4lJSWSpPnz58f8Oe3du1eS1KdPn5ZlmzdvVmNjo+bNm3fFOV++GPjfQX3uueckSXPnzm11\n7OWInz59+or7QftAUNuoCxcuqEOHDm7be+mll/TCCy+ooqJCx48f1/vvvy9Jio+PV9++fVVXV6e0\ntLSIuwNKS0s1evTomHcZFBUVaeTIkR/qLoTa2tqoV8oPHTqkDRs26NVXX9W7776r6urqltu5srKy\nlJGRofPnzysvLy9s3OWgTps2LeY+y8rK1KFDh5ajY0nauXOnsrOzWz26vKympkYJCQlh+/7Xv/6l\nnJycsEjHer+SdN11111xP2gf+MjfRnXt2lVnzpy54v2e/83MdM8994R9/A2FQvrOd76jSZMmqaKi\nQjNmzNDatWu1a9cuHTlyRA0NDaqsrFT37t2Vm5sbdq/re++9p6NHj2rUqFEx93ns2LErHnFKUkND\ng/bt2xcR1D/+8Y/64he/qLVr1+rmm2/WAw88oIKCgpaP89XV1fre974nSVGDOmTIkFb3X1JSotzc\n3LB/nI4eParevXtfcc6S9MYbb2jgwIFKS0trWXbw4MFWTxX891hJuvHGGz/UvtAOXOuTuIhuzpw5\nJslKS0s/9JhNmzaZJFuwYEHLsstXudevXx9zXHV1tcXFxUVc2Ll8p0FBQUHUcaFQyAKBgM2ePfuK\nc3vxxRdNku3YsaNl2cmTJy0tLc2+9rWv2dmzZ2OOnThxonXp0sVCoVDLsst3HyxcuDDmuDNnzlhc\nXJz96Ec/Clt+0003tXqR7bJ3333X4uLi7J577glbnpiYaHPmzLni+Ly8POvcuXPEnQdovzhCbaPG\njx8v6T/nKD+M+vp6/fSnP1Xnzp3DLiBt2rRJw4cP16xZs2KO3bhxo0KhUMQRYGlpqeLi4jR8+PCo\n4wKBgDIyMnT48OErzu+xxx5TXFychg0b1rJs27Ztqq+v16OPPhrzY/HJkydVUFCgYDAY9vWE5eXl\nam5ubvXppfLy8qg35Hfr1q3lol9r1qxZE3V8x44ddfbs2VbHlpeXq7y8XDNnzlRcHH9mnxX8ptuo\n2267Tf369dP69etbPjrGcvHiRd155506dOiQVq9erczMzJZ1J0+eVMeOHWOObWxs1Lp16yRJQ4YM\nCVtXWlqqgQMHKj09Peb4ESNGqKysLOZTVpL0+9//XoWFhfrCF76gTp06tSw/ceKEJLU6v8cff1wX\nL16MmNvl86etBfXyHQq33HJL2PJRo0apqqoq5tNXkvT222/r8ccfj7qPYDCowsLCmI/tmpkWL16s\n1NRU/eQnP4m5D7RD1/oQGbEVFhZafHy8ZWVlWWFhYdTXvPPOO5afn2+SbPHixRHrJ02aZGlpabZ/\n//6IdQ0NDTZjxgyTZIFAwBoaGlrWNTc3W3p6us2aNavVOW7dutUk2bx586Ku/8tf/mIpKSkmyb7/\n/e+HrduyZYtJshUrVkQdu3HjRktISDBJtm7durB106dPtx49erQ6t2nTpllWVlbE8n379lliYqKN\nGTPGmpqaItYfPHjQ+vTpY4mJiZaenh7xkf35559v9aGLBx54wCTZmjVrItaFQiH7+te/bvn5+fb6\n669HrF+yZInl5+fbhg0bItZt3brV8vPzP9TpBlwbBLWN27p1q6WmplogELCxY8faQw89ZE8++aSt\nXLnSpk6daomJiZaammq//vWvo47ftWuXJSUlWXZ2tq1bt85KS0utoKDAHn74YcvJybEpU6bYxIkT\nLTk5OewcZWVlpUmyp5566opznDZtmkmyKVOm2Msvv2y7d++2l19+2e666y5LTU21hx56yCTZk08+\nGTbuwoULNnToUEtISLB58+bZzp07rbi42J555hmbNGmSXX/99S1fSbhx48awsdnZ2Vd8GCA7O9sm\nT54cdd3KlStNkg0dOtSee+45Kysrs+3bt9uCBQusc+fOtnDhQhswYIDl5+dHjA2FQjZ16lSTZLff\nfru98sortmfPHvvzn/9st912m8XHx0c8IHHZ3r17TZJJivpUWXZ2dtT3a2Z21113Rf2HCW0HQf0U\nOHbsmM2fP9/69OnT8scoyfr06WP333+/vfPOO62OLyoqsi9/+cuWmppqkiw5OdnGjRtnmzdvtlAo\nZKtWrbJgMGgnTpxoGbN9+3YLBoNRj2z/v6amJlu2bJn16tWrZW5ZWVk2e/ZsO3z4sD3zzDMmyd54\n442IsadOnbLZs2dbVlZWy5Fy//79bcmSJVZXV2d79+61YDAYdsR26tQpCwaDEY+T/v/tBoPBVi/G\nbdq0yfLy8iwQCJgkS0tLs8mTJ9urr75qDQ0NNmzYMHvsscdivuef//znlpOT0/Keu3TpYnfccYeV\nlZXF3Ocrr7xiwWDQJkyYELGutrbWgsGgBYNBO3z4cMT622+/3YLBYMTjwWg7AmZ819inycWLF3X2\n7NmPfdP/mTNnWj0nerUaGxtlZmH3pU6ePFnFxcWqrq5u9QJNfX29OnTo8Il/5+ilS5dUX1//sX8u\nTU1Nam5uDru1Cp9NXJT6lElMTFRGRsbHfoLKM6bFxcVatWqVzp0717IsJSUlLKbHjh3TX//6V33z\nm9+84tXutLS0a/IFzgkJCVf1c0lOTiamkERQcRUOHTqkRYsWxfzfARoaGvTd735X8fHxXO3GZwKP\nnuJjmzRpknr06KH77rtPtbW1mjhxorp3765jx46poqJCv/zlL7V//349/fTTysnJudbTBf7nOIeK\nq7J//37NnTtXf//73yO+hX/48OFasWJFzC9WAdobggoXp0+f1tGjR3XixAl16NBB/fr1U1ZW1rWe\nFvCJIqgA4ISLUgDghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggq\nADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADg\nhKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOC\nCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoA\nOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCE\noAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IK\nAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4\nIagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISg\nAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoA\nTggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADgh\nqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKAC\ngBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBO\nCCoAOCGoAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGo\nAOCEoAKAE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKA\nE4IKAE4IKgA4IagA4ISgAoATggoATggqADghqADghKACgBOCCgBOCCoAOCGoAOCEoAKAE4IKAE4I\nKgA4IagA4ISgAoATggoATggqADghqADghKACgJP/AxAUOuY0BmpVAAAAAElFTkSuQmCC');
            image[i].setAttribute('class', 'preload');
            image[i].setAttribute('width', settings.imgslist[i].width);
            image[i].setAttribute('height', settings.imgslist[i].height);

            svg[i] = document.createElementNS(xmlns, 'svg');
            svg[i].setAttribute('viewBox', '0 0 ' + settings.imgslist[i].width + ' ' + settings.imgslist[i].height);
            svg[i].setAttribute('width', settings.imgslist[i].width * factor);
            svg[i].setAttribute('height', settings.imgslist[i].height * factor);
            svg[i].appendChild(image[i]);

            page[i] = document.createElement('div');
            page[i].setAttribute('class', 'page preload');
            page[i].setAttribute('id', 'page_' + i);
            page[i].setAttribute('idx', i);
            page[i].appendChild(svg[i]);

            divPages.appendChild(page[i]);

            if (page[i].offsetTop < divPagePanel.clientHeight) {
                $(divPagePanel).trigger('scroll');
            }
        }
    }

    function setHandlers() {
        if (settings.sidebar) {
            if (settings.bookmarks) {
                $(divIndex).click(function () {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                    } else {
                        if ($(divThumbnails).is(':visible')) {
                            toggleThumbnails();
                        }

                        $('.option', divOptions).removeClass('active');
                        $(this).addClass('active');
                    }
                });
            }

            $(divDoclist).click(function () {
                if ($(divThumbnails).is(':hidden')) {
                    $('.option', divOptions).removeClass('active');
                    $(this).addClass('active');
                }

                toggleThumbnails();
            });

            $(divThumbnails).scroll(scrollThumbnails);
        }

        if (settings.statusbar) {
            $('.btnPage.prev, .btnPage.next', divCtrlPage).click(function () {
                if ($(this).hasClass('prev')) {
                    turnPage('prev');
                } else if ($(this).hasClass('next')) {
                    turnPage('next');
                }
            });

            $(txtCurrPage).focus(function () {
                this.select();
            });

            $(txtCurrPage).keypress(function (e) {
                var idx;
                if (e.which == 13) {
                    idx = parseInt($(this).val() - 1, 10);

                    if (isNaN(idx)) {
                        $(this).val(currPage + ' / ' + lastPage);
                        return;
                    }

                    if (idx < 0) {
                        idx = 0;
                    } else if (idx > lastPage) {
                        idx = lastPage - 1;
                    }

                    $(divPagePanel).animate({
                        scrollTop: $('#page_' + idx, divPages)[0].offsetTop
                    }, 400);

                    $(this).val(idx + ' / ' + lastPage);

                    currPage = idx;

                    e.target.blur();
                }
            });

            $(divZoomIn).click(function () {
                that.zoom('in');
            });

            $(divZoomOut).click(function () {
                that.zoom('out');
            });

            $(txtZoom).click(function () {
                that.zoom('restore');
            });
        }

        $(divPagePanel).scroll(scrollPages);
    }

    /*** Public functions ***/
    this.zoom = function (action) {
        var value, scrollPos;

        $(divPagePanel).finish();

        scrollPos = divPagePanel.scrollTop / divPagePanel.scrollHeight;

        if (action == 'in') {
            value = (zoomScale == 300) ? 300 : zoomScale + 25;
        } else if (action == 'out') {
            value = (zoomScale == 50) ? 50 : zoomScale - 25;
        } else if (action == 'restore') {
            value = 100;
        }

        $('.page svg', divPages).each(function (idx) {
            $(this).finish().animate({
                width: $(this).width() * value / zoomScale,
                height: $(this).height() * value / zoomScale
            }, 300);
        });

        $(divPagePanel).animate({
            fakeAttr: 300
        }, {
            step: function (now, fx) {
                fx.elem.scrollTop = fx.elem.scrollHeight * scrollPos;
            },
            duration: 300,
            complete: function () {
                zoomScale = value;

                if (txtZoom != null) {
                    txtZoom.innerHTML = value + '%';
                }
            }
        });
    };

    this.loadImages = function (list) {
        settings.imgslist = list;
        lastPage = list.length;
        divPagePanel.scrollTop = 0;
        that.zoom('restore');
        $(divPages).empty();
        loadImages();
    };

    this.turnPage = function (dir) {
        turnPage(dir);
    };

    this.gotoPage = function (value) {
        var idx = parseInt(value - 1, 10);
        if (isNaN(idx)) {
            $(txtCurrPage).val(currPage + ' / ' + lastPage);
            return;
        }

        if (idx < 0) {
            idx = 0;
        } else if (idx > lastPage) {
            idx = lastPage - 1;
        }

        $(divPagePanel).animate({
            scrollTop: $('#page_' + idx, divPages)[0].offsetTop
        }, 400);

        $(txtCurrPage).val(idx + ' / ' + lastPage);

        currPage = idx;
    };

    this.destroy = function () {
        $(settings.parent).empty();
        eval(settings.name + ' = null');
    };

    /*** Initialize viewer ***/
    setHandlers();

    loadImages();
}