
/*

jquery.boardmaker

* Version: 0.0.6
* Updated: Dec 23th 2013
* Created by geta6
 */

(function() {
  (function($) {
    var def_opts, getVendorPrefix;
    def_opts = {
      width: false,
      height: false,
      wrap: '.bm-wrap',
      ul: '.bm-ul',
      li: '.bm-li',
      index: 0,
      zIndex: 0,
      type: 'slide',
      time: 360,
      margin: 60,
      cssSupport: true,
      touchSupport: true,
      navigation: {
        active: true,
        nextClass: 'bm-next',
        prevClass: 'bm-prev'
      },
      pagination: {
        active: true,
        wrapClass: 'bm-jump-wrap',
        jumpClass: 'bm-jump'
      },
      callback: {
        complete: function() {},
        before: function(index) {},
        after: function(index) {}
      }
    };
    getVendorPrefix = function() {
      var i, j, ref, style, transition, vendor;
      style = (document.body || document.documentElement).style;
      transition = 'transition';
      vendor = ['Webkit', 'Moz', 'Khtml', 'O', 'ms'];
      transition = transition.charAt(0).toUpperCase() + transition.substr(1);
      for (i = j = 0, ref = vendor.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (typeof style[vendor[i] + transition] === 'string') {
          return vendor[i];
        }
      }
      return false;
    };
    $.extend($.easing, {
      easeOutCubic: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
      }
    });
    return $.fn.boardmake = function(usr_opts) {
      var $initialized, $li, $navinext, $naviprev, $page, $pagejump, $pagewrap, $ul, $wrap, baseIndex, bindCssSupport, bmUpdate, currentHeight, currentWidth, i, j, opts, prewidth, ref, ref1, ref2, ref3, unbindCssSupport;
      if (usr_opts == null) {
        usr_opts = {};
      }
      if (1 > this.size()) {
        return;
      }
      $initialized = false;
      opts = $.extend({}, def_opts, usr_opts);
      $wrap = this.find(opts.wrap);
      $ul = this.find(opts.ul);
      $li = this.find(opts.li);
      if (0 === $wrap.size()) {
        return console.error("no wrap, boardmaker aborted (" + opts.wrap + ")");
      }
      if (0 === $ul.size()) {
        return console.error("no ul, boardmaker aborted (" + opts.ul + ")");
      }
      this.data('bm:current', opts.index);
      this.data('bm:prefix', getVendorPrefix());
      if ((ref = opts.type) !== 'slide' && ref !== 'none') {
        opts.type = 'none';
      }
      baseIndex = parseInt(this.css('zIndex'), 10);
      if (isNaN(baseIndex)) {
        baseIndex = opts.zIndex;
      }
      if ((ref1 = this.css('position')) !== 'relative' && ref1 !== 'absolute' && ref1 !== 'fixed') {
        this.css('position', 'relative');
        this.css('zIndex', baseIndex);
      }
      if ((ref2 = $wrap.css('position')) !== 'relative' && ref2 !== 'absolute' && ref2 !== 'fixed') {
        $wrap.css('position', 'relative');
        $wrap.css('zIndex', baseIndex + 1);
      }
      $wrap.css('overflow', 'hidden');
      $li.each(function(i, el) {
        ($(el)).attr('data-bm-index', i);
        if (i !== opts.start) {
          return ($(el)).hide();
        }
      });
      this.data('bm:length', $page = $li.size());
      if ($page <= opts.index) {
        opts.index = $page - 1;
        this.data('bm:current', $page - 1);
      }
      currentWidth = opts.width;
      currentHeight = opts.height;
      bmUpdate = (function(_this) {
        return function(width, height) {
          $wrap.css('width', currentWidth = width);
          $wrap.css('height', currentHeight = height);
          $li.each(function(i, el) {
            return ($(el)).show().css({
              margin: "0 " + opts.margin + " 0 0",
              padding: 0,
              position: 'absolute',
              top: 0,
              left: (width + opts.margin) * i,
              bottom: 0,
              width: width,
              height: height
            });
          });
          $ul.css({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: -1 * (width + opts.margin) * _this.data('bm:current'),
            padding: 0,
            width: (width + opts.margin) * ($page + 1),
            zindex: baseIndex + 2
          });
          if (2 > $page) {
            $navinext.hide();
            $naviprev.hide();
          }
          if (2 > $page) {
            return $pagewrap.hide();
          }
        };
      })(this);
      $navinext = null;
      $naviprev = null;
      if (opts.navigation.active) {
        $navinext = this.find("." + opts.navigation.nextClass);
        $naviprev = this.find("." + opts.navigation.prevClass);
        if (!$navinext.size()) {
          this.append($navinext = ($('<div>')).addClass(opts.navigation.nextClass));
        }
        if (!$naviprev.size()) {
          this.append($naviprev = ($('<div>')).addClass(opts.navigation.prevClass));
        }
        $navinext.on('click', (function(_this) {
          return function() {
            return _this.trigger('bm:next');
          };
        })(this));
        $naviprev.on('click', (function(_this) {
          return function() {
            return _this.trigger('bm:prev');
          };
        })(this));
        $navinext.css('zIndex', baseIndex + 3);
        $naviprev.css('zIndex', baseIndex + 3);
      }
      if (opts.pagination.active) {
        $pagewrap = this.find("." + opts.pagination.wrapClass);
        $pagejump = this.find("." + opts.pagination.jumpClass);
        if (!$pagewrap.size()) {
          this.append($pagewrap = ($('<div>')).addClass(opts.pagination.wrapClass));
        }
        if (!$pagejump.size()) {
          for (i = j = 0, ref3 = $page; 0 <= ref3 ? j < ref3 : j > ref3; i = 0 <= ref3 ? ++j : --j) {
            $pagewrap.append($('<div>')).addClass(opts.pagination.jumpClass).attr('data-bm-index', i).append($('<a>'));
          }
          $pagejump = this.find("." + opts.pagination.jumpClass);
        }
        $pagejump.on('click', (function(_this) {
          return function(event) {
            var index;
            index = parseInt(($(event.currentTarget)).attr('data-bm-index'), 10);
            return _this.trigger('bm:jump', {
              page: index
            });
          };
        })(this));
        $pagewrap.css('zIndex', baseIndex + 3);
      }
      bmUpdate(opts.width, opts.height);
      this.css({
        display: 'block',
        visibility: 'visible'
      });
      bindCssSupport = (function(_this) {
        return function() {
          var animation, prefix, transform;
          if (opts.cssSupport && (prefix = _this.data('bm:prefix'))) {
            transform = prefix + "Transition";
            animation = 'cubic-bezier(0.215, 0.610, 0.355, 1.000)';
            return $ul.css(transform, "margin-left " + (opts.time / 1000) + "s " + animation);
          }
        };
      })(this);
      unbindCssSupport = (function(_this) {
        return function() {
          var prefix, transform;
          if (opts.cssSupport && (prefix = _this.data('bm:prefix'))) {
            transform = prefix + "Transition";
            return $ul.css(transform, '');
          }
        };
      })(this);
      this.on('bm:last', (function(_this) {
        return function(event, data) {
          return _this.trigger('bm:jump', {
            page: $page - 1
          });
        };
      })(this));
      this.on('bm:first', (function(_this) {
        return function(event, data) {
          return _this.trigger('bm:jump', {
            page: 0
          });
        };
      })(this));
      this.on('bm:next', (function(_this) {
        return function(event, data) {
          var next;
          next = (_this.data('bm:current')) + 1;
          if ($page - 1 < next) {
            next = 0;
          }
          return _this.trigger('bm:jump', {
            page: next
          });
        };
      })(this));
      this.on('bm:prev', (function(_this) {
        return function(event, data) {
          var next;
          next = (_this.data('bm:current')) - 1;
          if (0 > next) {
            next = $page - 1;
          }
          return _this.trigger('bm:jump', {
            page: next
          });
        };
      })(this));
      this.on('bm:jump', (function(_this) {
        return function(event, data) {
          var $next, $prev, events, jump, k, len, next, page, prefix, prev;
          data.callback || (data.callback = function() {});
          page = data.page;
          prev = _this.data('bm:current');
          next = page;
          if (prev === null) {
            prev = 0;
          }
          $prev = $li.filter("[data-bm-index=" + prev + "]");
          $next = $li.filter("[data-bm-index=" + next + "]");
          $pagejump.find('a').removeClass('active');
          for (k = 0, len = $pagejump.length; k < len; k++) {
            jump = $pagejump[k];
            jump = $(jump);
            if (next === parseInt(jump.attr('data-bm-index'), 10)) {
              jump.find('a').addClass('active');
            }
          }
          if ($initialized) {
            opts.callback.before(next);
          }
          switch (opts.type) {
            case 'slide':
              if (opts.cssSupport && (prefix = _this.data('bm:prefix'))) {
                events = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'otransitionend', 'MSTransitionEnd'];
                $ul.off(events.join(' '));
                $ul.on(events.join(' '), function() {
                  if ($initialized) {
                    opts.callback.after(next);
                    return data.callback();
                  }
                });
                $ul.css({
                  marginLeft: -1 * (currentWidth + opts.margin) * next
                });
                if (!$initialized) {
                  window.setTimeout(function() {
                    return data.callback();
                  }, opts.time);
                }
              } else {
                $ul.stop().animate({
                  marginLeft: -1 * (currentWidth + opts.margin) * next
                }, {
                  duration: opts.time,
                  easing: 'easeOutCubic',
                  complete: function() {
                    if ($initialized) {
                      opts.callback.after(next);
                    }
                    return data.callback();
                  }
                });
              }
              break;
            case 'none':
              $ul.stop().css({
                marginLeft: -1 * (currentWidth + opts.margin) * next
              });
              if ($initialized) {
                opts.callback.after(next);
              }
              data.callback();
          }
          return _this.data('bm:current', next);
        };
      })(this));
      if (opts.touchSupport) {
        this.on('touchstart', (function(_this) {
          return function(event) {
            var touches;
            event.stopPropagation();
            touches = event.originalEvent.touches[0];
            _this.data('bm:touchstartx', touches.pageX);
            _this.data('bm:touchstarty', touches.pageY);
            _this.data('bm:touchstart', parseInt($ul.css('marginLeft'), 10));
            return unbindCssSupport();
          };
        })(this));
        this.on('touchmove', (function(_this) {
          return function(event) {
            var scrolling, scrollx, scrolly, touches, touchmove;
            event.stopPropagation();
            touches = event.originalEvent.touches[0];
            scrollx = Math.abs(touches.pageX - _this.data('bm:touchstartx'));
            scrolly = Math.abs(touches.pageY - _this.data('bm:touchstarty'));
            _this.data('bm:scrolling', scrolling = scrollx < scrolly);
            if (!scrolling) {
              touchmove = touches.pageX - _this.data('bm:touchstartx');
              return $ul.css('marginLeft', _this.data('bm:touchstart') + touchmove);
            }
          };
        })(this));
        this.on('touchend', (function(_this) {
          return function(event) {
            var diff, touches;
            event.stopPropagation();
            touches = event.originalEvent.touches[0];
            if (!touches) {
              touches = event.originalEvent.changedTouches[0];
            }
            bindCssSupport();
            diff = touches.pageX - _this.data('bm:touchstartx');
            if (currentWidth * -0.3 > diff) {
              if ($page - 1 < _this.data('bm:current')) {
                return _this.trigger('bm:last');
              }
              return _this.trigger('bm:next');
            }
            if (currentWidth * 0.3 < diff) {
              if (0 < _this.data('bm:current')) {
                return _this.trigger('bm:prev');
              }
              return _this.trigger('bm:first');
            }
            return _this.trigger('bm:jump', {
              page: _this.data('bm:current')
            });
          };
        })(this));
      }
      prewidth = opts.width;
      this.on('bm:update', (function(_this) {
        return function(event) {
          var height, width;
          width = _this.width();
          if (prewidth === width) {
            return;
          }
          height = width * (opts.height / opts.width);
          prewidth = width;
          return bmUpdate(width, height);
        };
      })(this));
      window.setTimeout((function(_this) {
        return function() {
          _this.trigger('bm:update');
          _this.trigger('bm:jump', {
            page: _this.data('bm:current'),
            callback: function() {
              bindCssSupport();
              $initialized = true;
              return opts.callback.complete();
            }
          });
          return ($(window)).on('resize', function() {
            return _this.trigger('bm:update');
          });
        };
      })(this));
      return this;
    };
  })(jQuery);

}).call(this);
