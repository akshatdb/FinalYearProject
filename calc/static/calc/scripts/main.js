//Handle Changes
var imagename,osizex,osizey,change_list = {},clen = 0,numbers = [],numlist = [],symlist = [],result = 0;


function setresults(){
    result = 0;
    for (var i = 0;i < numbers.length; i++)
    {
        result = result + numbers[i][4];
    }
    $('.answer').text(result);
}
//find numbers in the image
function sortNumbers(){
    numbers.sort(function(a, b) {
        //sort by x, secondary by y
        return a[1]-b[1];
    });
    for(var i = 0;i< numbers.length;i++)
    {
       numbers[i][5] = i; 
    }
    for(var i = 0; i<numbers.length; i++)
    {
        curr = numbers[i];
        xc = curr[0];
        yc = curr[1];
        wc = curr[2];
        hc = curr[3];
        for(var j = 0; j<numbers.length; j++)
        {
            if(numbers[j][5]!=curr)
            {
                xp = numbers[j][0];
                yp = numbers[j][1];
                wp = numbers[j][2];
                hp = numbers[j][3];
                if( ((yp + hp) < (yc + hc + hc/2)) && (yp > yc-hc/2))
                {
                            numbers[j][5] = curr[5];
                }
            }
        }
    }
    numbers.sort(function(a,b){
        if (a[5]==b[5])
            return a[0]-b[0];
        else
            return 0;
    });
}
function sortDigits(){
    numlist.sort(function(a, b) {
        //sort by x, secondary by y
        return a[1]-b[1];
    });
    for(var i = 0;i< numlist.length;i++)
    {
       numlist[i][5] = i; 
    }
    for(var i = 0; i<numlist.length; i++)
    {
        curr = numlist[i];
        xc = curr[0];
        yc = curr[1];
        wc = curr[2];
        hc = curr[3];
        for(var j = 0; j<numlist.length; j++)
        {
            if(numlist[j][5]!=curr)
            {
                xp = numlist[j][0];
                yp = numlist[j][1];
                wp = numlist[j][2];
                hp = numlist[j][3];
                if( ((yp + hp) < (yc + hc + hc/2)) && (yp > yc-hc/2))
                {
                            numlist[j][5] = curr[5];
                }
            }
        }
    }
    numlist.sort(function(a,b){
        if (a[5]==b[5])
        {
            console.log(a[0] + ',' +    b[0] + 'for' + a[4] + ',' +b[4])
            return a[0]-b[0];
        }
        else
            return a[5]-b[5];
    });
}
function findNumbers(){
    c = -1;
    for(var i=0; i<numlist.length; i++)
    {
        if(numlist[i][5]!=c )
        {
            c = numlist[i][5];
            xptr = numlist[i][0];
            yptr = numlist[i][1];
            wptr = numlist[i][2];
            hptr = numlist[i][3];
            vptr = numlist[i][4];
        }
        else{
            yptr = numlist[i][1]<yptr?numlist[i][1]:yptr;
            wptr = (numlist[i][0]+numlist[i][2]) - xptr;
            vptr = vptr*10 + numlist[i][4];
        }
        if((i+1)>= numlist.length || numlist[i+1][5]!=c || (numlist[i+1][0] > (xptr + wptr +hptr/2)))
        {
          numbers.push([xptr,yptr,wptr,hptr,vptr]);
          c = -1;
        }
    }
}

function findLeftRight(i)
{
    xs = symlist[i][0];
    ys = symlist[i][1];
    ws = symlist[i][2];
    hs = symlist[i][3];
    cleft = 0;
    cright = 0;
    for(var j = 0; j < numbers.length; j++)
    {
        yn = numbers[j][1];
        hn = numbers[j][3];
        if(( yn-hs/3 < ys ) && ( (yn+hn+hs/3) > (ys+hs) ) )
        {
            xn = numbers[j][0];
            wn = numbers[j][2];
            if( (xn+wn-ws/3) < (xs) && (xn+wn+ws+ws) > (xs) )
            {
                leftOp = j;
                cleft++;
            }
            else if( (xn+ws/3) > (xs+ws) && (xn) < (xs+ws+ws+ws) )
            {
                rightOp = j;
                cright++;
            }
        }
    }
    if(cleft == 1 && cright == 1)
        return [true,leftOp,rightOp];
    else
        return [false,-1,-1];
}
function findAboveBelow(i)
{
    xs = symlist[i][0];
    ys = symlist[i][1];
    ws = symlist[i][2];
    hs = symlist[i][3];
    cnum = 0;
    cden = 0;
    for(var j = 0; j < numbers.length; j++)
    {
        xn = numbers[j][0];
        wn = numbers[j][2];
        if(( xn > (xs-ws/2) ) && ( (xn+wn) < (xs+ws+ws/2) ) )
        {
         
            hn = numbers[j][3];
            yn = numbers[j][1];
            if( ( yn > (ys-ws-ws) ) && ( (yn+hn) < (ys+hs) ) )
            {
                numerator = j;
                cnum++;
            }
            else if( ( yn > ys ) && ( (yn+hn) < (ys+ws+ws)))
            {
                denominator = j;
                cden++;
            }
        }
    }
    if(cnum == 1 && cden == 1)
        return [true,numerator,denominator];
    else
        return [false,-1,-1];
}

function sortOperators(){
    symlist.sort(function(a, b) {
        //sort by x, secondary by y
        return a[1]-b[1];
    });
    for(var i = 0;i< symlist.length;i++)
    {
       symlist[i][5] = i; 
    }
    for(var i = 0; i<symlist.length; i++)
    {
        curr = symlist[i];
        xc = curr[0];
        yc = curr[1];
        wc = curr[2];
        hc = curr[3];
        for(var j = 0; j<symlist.length; j++)
        {
            if(symlist[j][5]!=curr)
            {
                xp = symlist[j][0];
                yp = symlist[j][1];
                wp = symlist[j][2];
                hp = symlist[j][3];
                if( ((yp + hp) < (yc + hc + hc/3)) && (yp > yc-hc/3))
                {
                            symlist[j][5] = curr[5];
                }
            }
        }
    }
   symlist.sort(function(a,b){
        if (a[5]==b[5])
            return a[0]-b[0];
        else
            return 0;
    });
   for (var i=0;i < symlist.length;i++)
   {
        if(symlist[i][4] == '-')
        {
            if(findAboveBelow(i)[0])
            {
                symlist[i][4] = '/';
            }
        }
   }
}

//Calculate scales for recieved image
function scaleSizes(){
    wh = $(window).height();
    ww = $(window).width();
    while(sizex>ww || sizey>wh)
    {
        sizex = 0.9 * sizex;
        sizey = 0.9 * sizey;
    }
    return [sizex,sizey]

}

//draw number boxes
function digitDraw(){
        for (var i = 0; i < numlist.length;i++){
        digit = numlist[i];
        $('#div-img').append('<div id="num-'+i+'" class="num-box" data-id=' + i + ' ></div>');
        $('#num-'+i).text(digit[4]);
        $('#num-'+i).css({
            'height':digit[3],
            'width':digit[2],
            'top':digit[1],
            'left':digit[0]
        });
    }
}
function symbolDraw(){
        for (var i = 0; i < symlist.length;i++){
        symbol = symlist[i];
        $('#div-img').append('<div id="sym-'+i+'" class="num-box" data-id=' + i + ' ></div>');
        $('#sym-'+i).text(symbol[4]);
        $('#sym-'+i).css({
            'height':symbol[3],
            'width':symbol[2],
            'top':symbol[1],
            'left':symbol[0]
        });
    }
}
function drawList(listl)
{
    for (var i = 0; i < listl.length;i++){
        listn = listl[i];
        $('#div-img').append('<div id="listl-'+i+'" class="num-box" data-id=' + i + ' ></div>');
        $('#listl-'+i).text(listn[4]);
        $('#listl-'+i).css({
            'height':listn[3],
            'width':listn[2],
            'top':listn[1],
            'left':listn[0]
        });
    }
}

function solveDivisions(){
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][4] == '/')
        {
            xs = symlist[i][0];
            ys = symlist[i][1];
            ws = symlist[i][2];
            hs = symlist[i][3];
            [foundAboveBelow,numerator,denominator] = findAboveBelow(i);
            if(foundAboveBelow)
            {
                if(denominator == 0)
                {
                    infinityFlag = 1;
                    div = -1;
                }
                else{
                    div = (1.0*numbers[numerator][4])/numbers[denominator][4];             
                }
                newy = numbers[numerator][1];
                newh = numbers[denominator][1]+numbers[denominator][3] - newy;
                newx = xs;
                neww = ws;
                if(numerator>denominator)
                {
                    numbers.splice(numerator,1);
                    numbers.splice(denominator,1);
                }
                else
                {
                    numbers.splice(denominator,1);
                    numbers.splice(numerator,1);
                }
                symlist.splice(i,1);
                i= i -1;
                numbers.push([newx,newy,neww,newh,div,1]);
                sortNumbers();
            }

        }

    }
}
function solveMultiplications(){
    for(var i = 0; i < symlist.length ; i++)
    {
        if(symlist[i][4] == 'x')
        {
            xs = symlist[i][0];
            ys = symlist[i][1];
            ws = symlist[i][2];
            hs = symlist[i][3];
            [foundLeftRight, leftOp, rightOp] = findLeftRight(i);
            if(foundLeftRight)
            {
                product = numbers[leftOp][4] * numbers[rightOp][4];
                newy = numbers[leftOp][1]<numbers[rightOp][1]?numbers[leftOp][1]:numbers[rightOp][1];
                newx = numbers[leftOp][0];
                neww = numbers[rightOp][0]+numbers[rightOp][2] - newx;
                newh = (numbers[leftOp][1]+numbers[leftOp][3])>(numbers[rightOp][1]+numbers[rightOp][3])?(numbers[leftOp][1]+numbers[leftOp][3]):(numbers[rightOp][1]+numbers[rightOp][3]);
                newh = newh - newy;
                if(leftOp>rightOp)
                {
                    numbers.splice(leftOp,1);
                    numbers.splice(rightOp,1);
                }
                else
                {
                    numbers.splice(rightOp,1);
                    numbers.splice(leftOp,1);
                }
                symlist.splice(i,1);
                i = i -1;
                numbers.push([newx,newy,neww,newh,product,1]);
                sortNumbers();
            }
        }
    }
}
function solveAddSub(){
    for(var i = 0; i < symlist.length ; i++)
    {
        if(symlist[i][4] == '+' || symlist[i][4] == '-')
        {
            xs = symlist[i][0];
            ys = symlist[i][1];
            ws = symlist[i][2];
            hs = symlist[i][3];
            [foundLeftRight, leftOp, rightOp] = findLeftRight(i);
            if(foundLeftRight)
            {
                if(symlist[i][4]=='+')
                    answer = numbers[leftOp][4] + numbers[rightOp][4];
                else
                    answer = numbers[leftOp][4] - numbers[rightOp][4];
                newy = numbers[leftOp][1]<numbers[rightOp][1]?numbers[leftOp][1]:numbers[rightOp][1];
                newx = numbers[leftOp][0];
                neww = numbers[rightOp][0]+numbers[rightOp][2] - newx;
                newh = (numbers[leftOp][1]+numbers[leftOp][3])>(numbers[rightOp][1]+numbers[rightOp][3])?(numbers[leftOp][1]+numbers[leftOp][3]):(numbers[rightOp][1]+numbers[rightOp][3]);
                newh = newh - newy;
                if(leftOp>rightOp)
                {
                    numbers.splice(leftOp,1);
                    numbers.splice(rightOp,1);
                }
                else
                {
                    numbers.splice(rightOp,1);
                    numbers.splice(leftOp,1);
                }
                symlist.splice(i,1);
                i = i - 1;
                numbers.push([newx,newy,neww,newh,answer,1]);
                sortNumbers();
            }
        }
    }
}

function findResult(){
    lastlength = 0;
    solveDivisions();
    solveMultiplications();
    solveAddSub();
    sortOperators();
    solveDivisions();
}

//Process Incoming Data for image
function processdata(data){
    osizex = sizex = data['image']['x'];
    osizey = sizey = data['image']['y'];
    imagename = data['imagename'];
    newsize = scaleSizes();
    sizex = newsize[0];
    sizey = newsize[1];
    for (var key in data)
    {
        if(key != 'image' && key != 'imagename'){
            xa = data[key]['x']*sizex-(data[key]['w']*sizex)/6;
            ya = data[key]['y']*sizey-(data[key]['h']*sizey)/6;
            wa = data[key]['w']*sizex+(data[key]['w']*sizex)/3;
            ha = data[key]['h']*sizey+(data[key]['h']*sizey)/3;
            va = data[key]['val'];
            if(Number(va) <= 9)
                numlist.push([xa,ya,wa,ha,Number(va),Number(key)]);
            else
                symlist.push([xa,ya,wa,ha,va,Number(key)])
        }
    }
    var tmp = $('#file').prop('files')[0];
    $('#div-img').css({
        'width':sizex,
        'height':sizey,
        'background-image':'url(' + URL.createObjectURL(tmp) + ')'
    });
    digitDraw();
    //symbolDraw();
    sortDigits();
    findNumbers();
    sortOperators();
    findResult();
    setresults();
    $('.num-box').on('click',function(){
        $(this).addClass('selected-num');
        val = prompt("Please enter correct value");
        $(this).text(val);
        i = $(this).data('id');
        change_list[clen] = {
        	'x':numlist[i][0]/sizex,
        	'y':numlist[i][1]/sizey,
        	'w':numlist[i][2]/sizex,
        	'h':numlist[i][3]/sizey,
        	'iname':imagename,
        	'val':val
        };
        clen++;
    });
}


var Upload = function (file,addr,reqt,csrf) {
    this.file = file;
    this.addr = addr;
    this.reqt = reqt;
    this.csrf = csrf;
};


//Upload
Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function () {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("image", this.file, this.getName());
    formData.append("req_type", this.reqt);
    formData.append("csrfmiddlewaretoken", this.csrf);
    $('.overlay').fadeIn('fast');
    $('body').addClass('overlay-open');
    $.ajax({
        type: "POST",
        url: that.addr,
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function (data) {
            // your callback here
            $('#process-wrp').fadeOut('fast');
            processdata(data);
        },
        error: function (error) {
            // handle error
            $('#failed-wrp').fadeIn('fast');
            $('.overlay').fadeOut('slow');
        },
        async: true,
        data: formData,
        cache: false,
        dataType: 'json',
        contentType: false,
        processData: false,
        timeout: 60000
    });
};


//Upload progress
Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }
    // update progressbars classes so it fits your code
    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
    $(progress_bar_id + " .status").text(percent + "%");
    if(percent == 100)
    {
        $(progress_bar_id).fadeOut('fast');
        $('#process-wrp').fadeIn('fast');
    }
};


//Main
$(document).ready(function(){
$('#file').on('change',function(){
	if($('#file').val() != '')
	{
		$container = $('body');
		$scrollTo = $('.choice-div');
		var tmp = $('#file').prop('files')[0];
		$('#file-upload-label').hide();
		$('.choice-div').fadeIn();
		$('.form').css({
			'top':'40%'
		})
		$('#image-view').attr('src',URL.createObjectURL(tmp));
		$('body,html').animate({
			scrollTop: $scrollTo.outerHeight()
		});
		$('#image-view').fadeIn();
	}
});
});
