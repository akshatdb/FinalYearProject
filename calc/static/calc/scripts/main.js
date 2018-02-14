//Handle Changes
var imagename,osizex,osizey,change_list = {},clen = 0,numbers = [],numlist = [],symlist = [],result = 0,charList = [],equationList =[],coefficients = [], varlist = [];


function setResult()
{
    result = 0;
    resultstr = '';
    for (var i = 0;i < symlist.length; i++)
    {
        result = result + Number(symlist[i][4]);
        resultstr = resultstr + '+' + symlist[i][4];
    }
    $('.answer').html(resultstr.substr(1) + ' = ' + result);
}

function setEqResults(ans,X)
{
    result = '';
    for(var i = 0; i < ans.length; i++)
    {
        result = result + ',' + X[i] + ' = ' + ans[i].toFixed(4);
    }
    $('.answer').html(result.substr(1));
}
//find numbers in the image
function sortList(slist){
    slist.sort(function(a, b) {
        return a[1]-b[1];
    });
    for(var i = 0;i< slist.length;i++)
    {
       slist[i][5] = i; 
    }
    tag = symlist[0][5];
    miny = symlist[0][1];
    maxy = symlist[0][1]+symlist[0][3];
    padding = symlist[0][3]/2;
    for(var i = 1; i<slist.length; i++)
    {
        if(symlist[i][1] > miny-padding && ((symlist[i][1]+symlist[i][3]) < maxy+padding))
        {
            symlist[i][5] = tag;
            miny = miny<symlist[i][1]?miny:symlist[i][1];
            maxy = maxy>(symlist[i][1]+symlist[i][3])?maxy:(symlist[i][1]+symlist[i][3]);
            padding = (maxy-miny)/2;
        }
        else{
            tag = symlist[i][5];
            miny = symlist[i][1];
            maxy = symlist[i][1]+symlist[i][3];
            padding = (maxy-miny)/2;
        }
    }
    slist.sort(function(a,b){
        if (a[5]==b[5])
            return a[0]-b[0];
        else
            return a[5]-b[5];
    });
    return slist
}

function findNumbers()
{
    state = 0;
    c = symlist[0][5];
    for(var i = 0; i < symlist.length; i++)
    {
        if (Number(symlist[i][4]) >= 0 && Number(symlist[i][4] <= 9) && state == 0)
        {
            num = Number(symlist[i][4]);
            start = i;
            state = 1;
            c = symlist[i][5];
        }
        else if((Number(symlist[i][4]) >= 0 && Number(symlist[i][4] <= 9) && state == 1) && symlist[i][5]==c && symlist[i][0] < (symlist[i-1][0]+symlist[i-1][2]+symlist[i-1][3]))
        {

            num = num*10 + Number(symlist[i][4]);
            symlist[start][4] = num;
            symlist[start][2] = symlist[i][0]+symlist[i][2]-symlist[start][0];
            symlist[start][3] = (symlist[i][1]+symlist[i][3])>(symlist[start][1]+symlist[start][3])?(symlist[i][1]+symlist[i][3]):(symlist[start][1]+symlist[start][3]);
            symlist[start][1] = symlist[i][1]<symlist[start][1]?symlist[i][1]:symlist[start][1];
            symlist[start][3] = symlist[start][3] - symlist[start][1];          
            symlist.splice(i,1);
            i = i - 1;
        }
        else if (state = 1)
        {
            if((Number(symlist[i][4]) >= 0 && Number(symlist[i][4] <= 9) && state == 1) && symlist[i][5]!=c)
            {
               i = i - 1;  
            }
            state = 0;
            num = 0;
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

function drawList(listl)
{
    for (var i = 0; i < listl.length;i++){
        listn = listl[i];
        $('#div-img').append('<div id="' + listl.length + '-'+i+'" class="num-box" data-id=' + i + ' ></div>');
        $('#'+listl.length + '-'+i).text(listn[4]);
        $('#'+listl.length + '-'+i).css({
            'height':listn[3],
            'width':listn[2],
            'top':listn[1],
            'left':listn[0]
        });
    }
}

function fixYs()
{
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][4]=='y')
        {
            symlist[i][3] = symlist[i][3]/2;
        }
    }
}
function findEquals()
{
    for(var i = 0; i < symlist.length; i++)
    {
        if(i < symlist.length-1 && symlist[i][4]=='-' && symlist[i+1][4]=='-')
        {
            xa = symlist[i][0];
            ya = symlist[i][1];
            wa = symlist[i][2];
            ha = symlist[i][3];
            xb = symlist[i+1][0];
            yb = symlist[i+1][1];
            wb = symlist[i+1][2];
            hb = symlist[i+1][3];
            if((ya < yb && ya+ha < yb+hb) || (yb < ya && yb+hb < ya+ha)){
                if(xa-wa < xb && xa+wa+wa > xb+wb)
                {
                    symlist[i][4] = '=';
                    symlist.splice(i+1,1);
                }
            }
        }
    }
}

function findAboveBelow(i)
{
    xs = symlist[i][0];
    ys = symlist[i][1];
    ws = symlist[i][2];
    hs = symlist[i][3];
    cnum = 0;
    cden = 0;
    for(var j = 0; j < symlist.length; j++)
    {
        if(symlist[j][4] == Number(symlist[j][4]))
        {
            xn = symlist[j][0];
            wn = symlist[j][2];
            if(( xn > (xs-ws/2) ) && ( (xn+wn) < (xs+ws+ws/2) ) )
            {
         
                hn = symlist[j][3];
                yn = symlist[j][1];
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
    }
    if(cnum == 1 && cden == 1)
        return [true,numerator,denominator];
    else
        return [false,-1,-1];
}

function solveUpDown(funcList)
{
    for(var i = 0; i < funcList.length; i++)
    {
        symlist[funcList[i][0]][4] = symlist[funcList[i][0]][4]/symlist[funcList[i][2]][4];
        symlist[funcList[i][0]][0] = symlist[funcList[i][1]][0];
        symlist[funcList[i][0]][2] = symlist[funcList[i][1]][2];
        symlist[funcList[i][0]][1] = symlist[funcList[i][0]][1];
        symlist[funcList[i][0]][3] = symlist[funcList[i][2]][1]+symlist[funcList[i][2]][3]-symlist[funcList[i][0]][1];
        symlist.splice(funcList[i][1],1);
        for(var j = i;j< funcList.length; j++)
        {
                if(funcList[j][0]>funcList[i][1])
                    funcList[j][0]--;
                if(funcList[j][1]>funcList[i][1])
                    funcList[j][1]--;
                if(funcList[j][2]>funcList[i][1])
                    funcList[j][2]--;
        }
        symlist.splice(funcList[i][2],1);
        for(var j = i;j< funcList.length; j++)
        {
                if(funcList[j][0]>funcList[i][1])
                    funcList[j][0]--;
                if(funcList[j][1]>funcList[i][1])
                    funcList[j][1]--;
                if(funcList[j][2]>funcList[i][1])
                    funcList[j][2]--;
        }
    }
}

function solveLeftRight(funcList)
{
    for(var i = 0; i < funcList.length; i++)
    {
        switch(symlist[funcList[i][1]][4])
        {
            case '+':
                symlist[funcList[i][0]][4] = Number(symlist[funcList[i][0]][4])+Number(symlist[funcList[i][2]][4]);
                break;
            case '-':
                symlist[funcList[i][0]][4] = Number(symlist[funcList[i][0]][4])-Number(symlist[funcList[i][2]][4]);
                break;
            case 'x':
                symlist[funcList[i][0]][4] = Number(symlist[funcList[i][0]][4])*Number(symlist[funcList[i][2]][4]);
        }
        symlist[funcList[i][0]][0] = symlist[funcList[i][0]][0];
        symlist[funcList[i][0]][2] = symlist[funcList[i][2]][0]+symlist[funcList[i][2]][2]-symlist[funcList[i][0]][0];
        symlist[funcList[i][0]][1] = symlist[funcList[i][0]][1]<symlist[funcList[i][2]][1]?symlist[funcList[i][0]][1]:symlist[funcList[i][2]][1];
        symlist[funcList[i][0]][3] = (symlist[funcList[i][0]][1]+symlist[funcList[i][0]][3])>(symlist[funcList[i][2]][1]+symlist[funcList[i][2]][3])?(symlist[funcList[i][0]][1]+symlist[funcList[i][0]][3]-symlist[funcList[i][0]][1]):(symlist[funcList[i][2]][1]+symlist[funcList[i][2]][3]-symlist[funcList[i][0]][1]);
        symlist.splice(funcList[i][1],2);
        for(var j = i;j< funcList.length; j++)
        {
                if(funcList[j][0]>funcList[i][2]-2)
                    funcList[j][0]=funcList[j][0]-2;
                if(funcList[j][1]>funcList[i][2]-2)
                    funcList[j][1]=funcList[j][1]-2;
                if(funcList[j][2]>funcList[i][2]-2)
                    funcList[j][2]=funcList[j][2]-2;
        }
    }
}

function findDivisions()
{
    divlist = [];
    for(var i=0;i < symlist.length; i++ )
    {
        [check, numerator, denominator] = findAboveBelow(i);
        if(check)
        {
            symlist[i][4] = '/';
            if(denominator!=0)
                divlist.push([numerator,i,denominator]);
            else
                infinityFlag = 1;
        }
    }
    return divlist;
}

function findMultiplications()
{
    mullist = [];
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][4]=='x')
        {
            if((i-1>=0 && symlist[i-1][5]==symlist[i][5])&& (i+1<symlist.length && symlist[i+1][5]==symlist[i][5]))
                mullist.push([i-1,i,i+1]);
            else if(i-1<0 || i+1 >= symlist.length)
                errFlag = 1;
        }
    }
    return mullist;
}

function findAddSubs()
{
    mullist = [];
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][4]=='+')
        {
            if((i-1>=0 && symlist[i-1][5]==symlist[i][5])&& (i+1<symlist.length && symlist[i+1][5]==symlist[i][5]))
                mullist.push([i-1,i,i+1]);
            else if(i-1<0 || i+1 >= symlist.length)
                errFlag = 1;
        }
        if(symlist[i][4]=='-')
        {
            if((i-1>=0 && symlist[i-1][5]==symlist[i][5])&& (i+1<symlist.length && symlist[i+1][5]==symlist[i][5]))
                mullist.push([i-1,i,i+1]);
        }
    }
    return mullist;
}

function countOp(ml)
{
    count = 0;
    for(var i = 0; i < ml.length ; i++)
    {
        if(ml[i][4]=='/'||ml[i][4]=='+'||ml[i][4]=='-'||ml[i][4]=='x')
            count++;
    }
    if(count>0)
        return true;
    else 
        return false;
}
function findResult(){
    while(countOp(symlist)){
        divlist = findDivisions();
        solveUpDown(divlist);
        divlist = findMultiplications();
        solveLeftRight(divlist);
        divlist = findAddSubs();
        solveLeftRight(divlist);
    }
}


function cutDownYs()
{
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][4] == 'y')
        {
            symlist[i][3] = symlist[i][3]/2;
        }
    }
}
function countAlpha()
{
    charList = {'x':0,'y':0,'z':0,'a':0,'b':0,'c':0};
    flag = 0;
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][4]=='a'||symlist[i][4]=='b'||symlist[i][4]=='c'||symlist[i][4]=='y')
        {
            charList[symlist[i][4]] = charList[symlist[i][4]] + 1;
            flag = 1;
            if(i-1>=0 && Number(symlist[i-1][4]) == symlist[i-1][4] && symlist[i-1][5] == symlist[i][5])
                coefficients.push([symlist[i][4],i,symlist[i-1][4],symlist[i][5]]);
            else
                coefficients.push([symlist[i][4],i,1]);
        }
        if(symlist[i][4]=='x')
            if(symlist[i-1][4]=='+'||symlist[i-1][4]=='x'||symlist[i-1][4]=='-'||symlist[i+1][4]=='+'||symlist[i+1][4]=='x'||symlist[i+1][4]=='-')
            {
                charList[symlist[i][4]] = charList[symlist[i][4]] + 1;
                flag = 1;
                if(i-1>=0 && Number(symlist[i-1][4]) == symlist[i-1][4] && symlist[i-1][5] == symlist[i][5])
                    coefficients.push([symlist[i][4],i,symlist[i-1][4],symlist[i][5]]);
                else
                    coefficients.push([symlist[i][4],i,1]);
            }    
                
    }
    if (flag > 0)
        return true;
    return false;
}

function findLinearEquations()
{
    tmp = [];
    c = symlist[0][5];
    for(var i = 0; i < symlist.length; i++)
    {
        if(symlist[i][5]==c)
            tmp.push(symlist[i]);
        else
        {
            equationList.push(tmp);
            tmp = [];
            tmp.push(symlist[i]);
            c = symlist[i][5];
        }
    }
    if(tmp.length>0)
        equationList.push(tmp);
}

function checkLinearEquations()
{
    varcount = 0;
    count = equationList.length;
    Object.keys(charList).forEach(function (key) { 
        var value = charList[key]
        if(value < equationList)
            return false;
        if(value > 0)
        {
            varlist[key] = varcount++;
        }
    });
    if(varcount > equationList)
        return false;
    return true;
}

function eqTag(c)
{
    for(var i = 0; i < equationList.length; i++)
    {
        if(equationList[i][0][5]==c)
            return i;
    }
}
function getCoefficients()
{
    m = [];
    n = [];
    for(var i = 0;i < equationList.length; i++)
    {
        for(var j = 0; j < equationList.length; j++)
            n.push(0);
        m.push(n);
        n = [];
    }
    for(var i = 0; i < coefficients.length; i++)
    {
        m[eqTag(coefficients[i][3])][varlist[coefficients[i][0]]] = m[eqTag(coefficients[i][3])][varlist[coefficients[i][0]]] + Number(coefficients[i][2]); 
    }
    return m;
}

function getConstants()
{
    m = [];
    n = 0;
    eq = -1;
    for(var i = 0;i < equationList.length; i++)
    {
        for(var j = 0; j < equationList[i].length; j++)
        {
            if(!(isNaN(equationList[i][j][4])) && (j+1<equationList[i].length && Object.keys(varlist).indexOf(equationList[i][j+1][4]) < 0 ))  
            {
                n = n + eq*Number(equationList[i][j][4]);
            }
            else if(equationList[i][j][4] == '=')
                eq = 1;
        }
        m.push([n]);
        n = 0;
        eq = -1;
    }
    return m;
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
            symlist.push([xa,ya,wa,ha,va,Number(key)]);
        }
    }
    var tmp = $('#file').prop('files')[0];
    $('#div-img').css({
        'width':sizex,
        'height':sizey,
        'background-image':'url(' + URL.createObjectURL(tmp) + ')'
    });
    drawList(symlist);
    cutDownYs();
    symlist = sortList(symlist);
    findEquals();
    findNumbers();
    if(countAlpha())
    {
        findLinearEquations();
        if(checkLinearEquations())
        {
            A = getCoefficients();
            B = getConstants();
            X = Object.keys(varlist);
            ans = numeric.solve(A,B);
            setEqResults(ans,X);
            //solveLinearEquations();
        }
        else
            console.log('invalid Equations');
    }
    else
    {
        console.log('what');
        //findResult();
        //setResult();
    }
    $('.num-box').on('click',function(){
        $(this).addClass('selected-num');
        val = prompt("Please enter correct value");
        $(this).text(val);
        i = $(this).data('id');
        change_list[clen] = {
        	'x':symlist[i][0]/sizex,
        	'y':symlist[i][1]/sizey,
        	'w':symlist[i][2]/sizex,
        	'h':symlist[i][3]/sizey,
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
