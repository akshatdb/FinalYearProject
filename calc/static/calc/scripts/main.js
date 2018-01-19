//Handle Changes
var x = [],y = [],w = [],h = [],values = [],imagename,osizex,osizey,change_list = {},clen = 0,nums = [],numlist = [],result = 0;
function setresults(){
    for (var i = 0;i < nums.length; i++)
    {
        result = result + nums[i][4];
    }
    $('.answer').text(result);
}
function find_num(){
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
        yc = curr[1];
        hc = curr[3];
        for(var j = 0; j<numlist.length; j++)
        {
            if(numlist[j][5]!=curr)
            {
                yp = numlist[j][1];
                hp = numlist[j][3];
                if( ((yp + hp) < (yc + hc + hc/3)) && (yp > yc-hc/3))
                {
                    numlist[j][5] = curr[5];
                }
            }
        }
    }
    numlist.sort(function(a,b){
        if (a[5]==b[5])
            return a[0]-b[0];
        else
            return 0;
    });
    c = -1;
    for(var i=0; i<numlist.length; i++)
    {
        if(numlist[i][5]!=c)
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
        if((i+1)>= numlist.length || numlist[i+1][5]!=c)
            nums.push([xptr,yptr,wptr,hptr,vptr]);
    }
}
function scalesizes(){
    wh = $(window).height();
    ww = $(window).width();
    var sizenx = sizex,sizeny = sizey;
    while(sizex>ww || sizey>wh)
    {
        sizenx = sizex;
        sizeny = sizey;
        sizex = 0.9 * sizex;
        sizey = 0.9 * sizey;
    }
    return [sizenx,sizeny]

}
function processdata(data){
    osizex = sizex = data['image']['x'];
    osizey = sizey = data['image']['y'];
    imagename = data['imagename'];
    newsize = scalesizes();
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
            values.push(va);
            x.push(xa);
            y.push(ya);
            w.push(wa);
            h.push(ha);
            numlist.push([xa,ya,wa,ha,va,Number(key)]);
        }
    }
    var tmp = $('#file').prop('files')[0];
    $('#div-img').css({
        'width':sizex,
        'height':sizey,
        'background-image':'url(' + URL.createObjectURL(tmp) + ')'
    });
    for (var i = 0; i < values.length;i++){
        $('#div-img').append('<div id="num-'+i+'" class="num-box" data-id=' + i + ' ></div>');
        $('#num-'+i).text(values[i]);
        $('#num-'+i).css({
            'height':h[i],
            'width':w[i],
            'top':y[i],
            'left':x[i]
        });
    }
    find_num();
    setresults();
    $('.num-box').on('click',function(){
        $(this).addClass('selected-num');
        val = prompt("Please enter correct value");
        $(this).text(val);
        i = $(this).data('id');
        change_list[clen] = {
        	'x':x[i]/sizex,
        	'y':y[i]/sizey,
        	'w':w[i]/sizex,
        	'h':h[i]/sizey,
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
		$('body').css({
			'background-image':'url(../static/calc/images/backblur.png)'
		});
		$('body,html').animate({
			scrollTop: $scrollTo.outerHeight()
		});
		$('#image-view').fadeIn();
	}
});
});
