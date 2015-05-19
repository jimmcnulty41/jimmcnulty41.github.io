	
$(window).load(function(){
	$('.nav').addClass('top_nav');

});

$(window).on('scroll', function(){
	var splashBottom = $('.splash').height() + $('.splash').offset().top;
	screen_top = $(window).scrollTop();

	if (screen_top + $('.nav').height() > splashBottom){
		$('.nav').addClass('scrolled_nav');
		$('.nav').removeClass('top_nav');
	}
	else {
		$('.nav').removeClass('scrolled_nav');
		$('.nav').addClass('top_nav');
	}

});
