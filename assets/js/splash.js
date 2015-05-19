$(window).load(resizeSplash);

$(window).resize(resizeSplash);

function resizeSplash(){
	// Get aspect ratio of splash image
	var image = new Image();
	image.src = '/assets/images/headerbar.jpg';
	var aspect = image.height/image.width;

	// Compute Desired height
	var new_height = window.innerWidth * aspect;
	var sZnew_height = new_height.toString() + "px";
	
	// Change splash section to proper height
	$('.splash').css('height', sZnew_height);
	var padding = $('.nav').height().toString() + "px";
	$('.splash_container').css('padding-top', padding);
	$('.splash_container').css('padding-bottom', padding);
}