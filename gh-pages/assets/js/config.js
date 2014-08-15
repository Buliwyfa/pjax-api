new Function().apply.apply(function (accessor) {
  var spec = accessor, initialize = true, always = true, finish = false;

/* init
  ========================================================================== */
  $(spec.init);
  spec.init = spec.clientenv;
  spec.init = spec.preload;
  spec.init = spec.pjax;
  spec.init = spec.visibilitytrigger;
  spec.init = function () {
    initialize = false;
  };

/* component
  ========================================================================== */

/* clientenv
  -------------------------------------------------------------------------- */
  spec.clientenv = function () {
    if (initialize) {
      $.clientenv({ font: { lang: 'ja' } })
      .addClass('hardware platform os windowsXP:lte windowsXP:gt browser ie ie8:lte')
      .addClass('font', 'Meiryo, メイリオ', 'meiryo')
      .clientenv({ not: false })
      .addClass('touch');
    }
  };

/* preload
  -------------------------------------------------------------------------- */
  spec.preload = function () {
    if (/touch|tablet|mobile|phone|android|iphone|ipad|blackberry/i.test(window.navigator.userAgent)) { return; }
    
    if (initialize) {
      $.preload({
        forward: $.pjax.follow,
        check: $.pjax.getCache,
        encode: true,
        ajax: {
          timeout: 2000,
          xhr: function () {
            var xhr = jQuery.ajaxSettings.xhr();

            $('div.loading').children().width('5%');
            if (xhr instanceof Object && 'onprogress' in xhr) {
              xhr.addEventListener('progress', function (event) {
                var percentage = event.total ? event.loaded / event.total : 0.4;
                percentage = percentage * 90 + 5;
                $('div.loading').children().width(percentage + '%');
              }, false);
              xhr.addEventListener('load', function (event) {
                $('div.loading').children().width('95%');
              }, false);
              xhr.addEventListener('error', function (event) {
                $('div.loading').children().css('background-color', '#00f');
              }, false);
            }
            return xhr;
          },
          success: function (data, textStatus, XMLHttpRequest) {
            !$.pjax.getCache(this.url) && $.pjax.setCache(this.url, null, textStatus, XMLHttpRequest);
          }
        }
      });
    }
    
    if (always) {
      $(document).trigger('preload');
    }
  };

/* pjax
  -------------------------------------------------------------------------- */
  spec.pjax = function () {
    if (initialize) {
      $.pjax({
        area: ['#container', 'body'],
        rewrite: function (document) {
          function escapeImage() {
            this.setAttribute('data-original', this.getAttribute('src'));
            this.setAttribute('src', '/img/gray.gif');
          }
          $('#primary, #secondary', document).find('img').each(escapeImage);

          function escapeIframe() {
            this.setAttribute('data-original', this.getAttribute('src'));
            this.setAttribute('src', 'javascript:false');
          }
          $('#primary', document).find('iframe').each(escapeIframe);
        },
        load: { css: true, script: true },
        cache: { click: true, submit: false, popstate: true },
        ajax: { cache: true, timeout: 3000 },
        scope: {
          test: '!*/[^/]+/test/',
          '/': ['/', '#test']
        },
        callbacks: {
          ajax: {
            xhr: function () {
              var xhr = jQuery.ajaxSettings.xhr();

              $('div.loading').children().width('5%');
              if (xhr instanceof Object && 'onprogress' in xhr) {
                xhr.addEventListener('progress', function (event) {
                  var percentage = event.loaded / event.total;
                  percentage = isFinite(percentage) ? percentage : 0.4;
                  percentage = percentage * 90 + 5;
                  $('div.loading').children().width(percentage + '%');
                }, false);
                xhr.addEventListener('loadend', function (event) {
                }, false);
              }
              return xhr;
            }
          },
          update: {
            before: function () {
              $('div.loading').children().width('95%');
            },
            content: {
              after: function () {
                $('div.loading').children().width('96.25%');
              }
            },
            css: {
              after: function () {
                $('div.loading').children().width('97.5%');
              }
            },
            script: {
              after: function () {
                $('div.loading').children().width('98.75%');
              }
            }
          }
        },
        load: {
          head: 'base, meta, link',
          css: true,
          script: true
        },
        server: { query: null },
        speedcheck: true
      });
      
      $(document).bind('pjax:ready', spec.init);
      $(document).bind('pjax:fetch', function () {
        $('div.loading').children().width('');
        $('div.loading').fadeIn(0);
      });
      $(document).bind('pjax:render', function () {
        $('div.loading').children().width('100%');
        $('div.loading').fadeOut(50);
      });
    }
  };

/* visibilitytrigger
  -------------------------------------------------------------------------- */
  spec.visibilitytrigger = function () {
    if (always) {
      $.visibilitytrigger();

      $.vt({
        ns: '.img.primary',
        trigger: '#primary img[data-original]',
        callback: function () { this.src = $(this).attr('data-original') },
        ahead: [0, .1],
        skip: true,
        terminate: false
      }).disable();

      $.vt({
        ns: '.img.secondary',
        trigger: '#secondary img[data-original]',
        callback: function () { this.src = $(this).attr('data-original') },
        ahead: [0, .1],
        skip: true,
        terminate: false
      }).disable();

      $.vt({
        ns: '.iframe.primary',
        trigger: '#primary iframe[data-original]',
        callback: function () { this.src = $(this).attr('data-original') },
        ahead: [0, .1],
        skip: true
      }).disable();

      $.vt({
        ns: ".sh.primary",
        trigger: "#primary pre.sh",
        callback: function () { SyntaxHighlighter && SyntaxHighlighter.highlight(SyntaxHighlighter.defaults, this); },
        ahead: [0, .1],
        step: 0,
        skip: true
      }).disable();

      $.vt.enable().vtrigger();
    }
  };

  return this;
},
FuncManager([
  'init',
  'preload',
  'pjax',
  'visibilitytrigger',
  'clientenv'
]).contextArguments);