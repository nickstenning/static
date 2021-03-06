/*
 * Prototype Footer searchy browsey thing.
 * Alex Torrance.
*/

$(document).ready(function() {
  
  // Footer Filter Fade Out
  // $('.prototype-footer-filter-actions').on('click', 'button', function(e) {
  //   e.preventDefault();
  //   
  //   var $this = $(this), $li = $('#footer').find('.prototype-footer-list li');
  //   if ($this.data('filter') != undefined) {
  //     $li.addClass('cloaked').filter('.prototype-filter-'+$this.data('filter')).removeClass('cloaked');
  //   } else {
  //     // show everything
  //     $li.removeClass('cloaked');
  //   }
  //   
  //   $this.parents('ul').find('button').removeClass('active');
  //   $this.addClass('active');
  // });
  
  // Footer Filter Swapsies
  $('.prototype-footer-list li').each(function() {
    var $this = $(this);
    
    if ($this.hasClass('cloaked')) $this.css({position:'absolute', left: '-5000px'}).removeClass('cloaked').addClass('wasCloaked');
    var h = $this.height();
    if ($this.hasClass('wasCloaked')) $this.attr('style', null).addClass('cloaked').removeClass('wasCloaked');
    $this.css({height: h});
  });
  
  $('.prototype-footer-filter-actions').on('click', 'button', function(e) {
    e.preventDefault();
    
    var $this = $(this), $li = $('#footer').find('.prototype-footer-list li');
    if ($this.data('filter') != undefined) {
      $li.addClass('cloaked').filter('.prototype-filter-'+$this.data('filter')).removeClass('cloaked');
      // $li.filter('.cloaked').slideUp();
    } else {
      // show everything
      $li.removeClass('cloaked');
    }
    
    $this.parents('ul').find('button').removeClass('active');
    $this.addClass('active');
  });

  // Set Up Browse Sections
  var slugs = [];
  
  $('.browse-sections').find('.results h2').each(function(i){
    var $this = $(this);
    slugs.push($this.attr('id'))
    $this.html("<a href='#/"+slugs[slugs.length-1]+"' class='toggle-section'>"+$(this).text()+"</a>");
  }).add('.browse-sections ol.group').wrapAll('<div class="sub-sections"></div>')
  .filter('ol.group').clone().appendTo('.browse-sections .results').wrapAll('<div class="browse-panel"></div>'); // clone ol's to a container

  $('.audience-filter').detach().prependTo('.browse-panel'); // move filter to browse panel
    
  // Browse sections click actions
  $('.results').on("click", ".toggle-section", function(e) {
    var $section = $(this).parent();
    var slug = $section.attr('id');

    $section.addClass('open')
      .siblings('h2').removeClass('open').end()
      .closest('.browse-sections').find('ol.group').removeClass("open-section")
      .filter('.section-'+slug).addClass('open-section');
      
    if ($(window).width() < 670) {
      // if inline (mobile) then scroll to section
      $(window).scrollTop($section.offset().top);
    }
  });
  
  // on page load parse hash
  if ($('.browse-sections').length > 0) {
    var hash = window.location.hash.substring(2);
    $('#'+hash).find('a').click();
    console.log(hash);
  }
  
  // Audience filter
  $('.audience-filter').on('click', 'a', function(e) {
    e.preventDefault();
    
    var filter = '.'+$(this).data('filter');
    if ($(this).data('filter') == '') filter = '*';
    
    $('.content-links li').addClass('filtered').filter(filter).removeClass('filtered');
    
    if (filter != '*') {
      if ($('.browse-panel .warning-notice').length == 0) {
        var html = '<div class="warning-notice"><p>The results below are filtered. <a href="#" class="clear-filter">Clear the filter</a> to show the full set of results.</p></div>';
        $('.audience-filter').after(html);
      }
    } else {
      $('.browse-panel .warning-notice').remove();
    }
    
    $(this).addClass('active').parent().siblings().find('a').removeClass('active');
  });
  
  $('.browse-panel').on('click', 'a.clear-filter', function(e) {
    e.preventDefault();
    $('.content-links li').show();
    $('.browse-panel .warning-notice').remove();
    $('.audience-filter a').removeClass('active').eq(0).addClass('active');
  });
  
});