/* README.md

# jquery.boardmaker - slide plug-in for jQuery

* Version: 0.0.6
* Updated: Dec 23th 2013
* Created by geta6


# usage

## script

```coffee
($ '#slide').boardmake
  width: 200
  height: 100
```


## dom

```slim
#slide
  .bm-wrap
    ul.bm-ul
      li.bm-li
        img src='slide.1.jpg'
      li.bm-li
        img src='slide.2.jpg'
      li.bm-li
        img src='slide.3.jpg'
      li.bm-li
        img src='slide.4.jpg'

  # ↓ generate if .size() is 0

  .bm-next
  .bm-prev
  .bm-jump-wrap
    .bm-jump data-bm-index=0
      a.active
    .bm-jump data-bm-index=1
      a
    .bm-jump data-bm-index=2
      a
```


# options

```coffee
width: no                   # fallback to element width
height: no                  # fallback to element height
wrap: '.bm-wrap'            # [[slide slide slide]]
ul: '.bm-ul'                # [slide slide slide]
li: '.bm-li'                # [slide]
index: 0                    # first slide
zIndex: 0                   # element base z-index
type: 'slide'               # slide or none
time: 360                   # animation effect time
margin: 60                  # [slide] <- margin -> [slide]
cssSupport: yes             # use css transition when available
touchSupport: yes           # add touch device support
navigation:
  active: yes               # event bind or not
  nextClass: 'bm-next'      # on click, navigate to next
  prevClass: 'bm-prev'      # on click, navigate to prev
pagination:
  active: yes               # event bind or not
  wrapClass: 'bm-jump-wrap' # pagination wrapper
  jumpClass: 'bm-jump'      # pagination body (dots)
callback:
  complete: ->              # on ready slide
  before: (index) ->        # on before animation
  after: (index) ->         # on after animation
```


# root element binded

  using `$.data` or `$.trigger` to access.


## data

    `bm:current`  slide current index
    `bm:length`   slide length
    `bm:prefix`   vendor prefix


## events

    `bm:next`     slide to next
    `bm:prev`     slide to prev
    `bm:jump`     navigate to specified page
                  { page: pageNumber, callback: -> }
    `bm:first`    navigate to first index
    `bm:last`     navigate to last index
    `bm:update`   re-render slide
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
      var i, style, transition, vendor, _i, _ref;
      style = (document.body || document.documentElement).style;
      transition = 'transition';
      vendor = ['Webkit', 'Moz', 'Khtml', 'O', 'ms'];
      transition = transition.charAt(0).toUpperCase() + transition.substr(1);
      for (i = _i = 0, _ref = vendor.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
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
      var $initialized, $li, $navinext, $naviprev, $page, $pagejump, $pagewrap, $ul, $wrap, baseIndex, bindCssSupport, bmUpdate, currentHeight, currentWidth, i, opts, prewidth, unbindCssSupport, _i, _ref, _ref1, _ref2,
        _this = this;
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
      if ((_ref = opts.type) !== 'slide' && _ref !== 'none') {
        opts.type = 'none';
      }
      baseIndex = parseInt(this.css('zIndex'), 10);
      if (isNaN(baseIndex)) {
        baseIndex = opts.zIndex;
      }
      if ((_ref1 = this.css('position')) !== 'relative' && _ref1 !== 'absolute' && _ref1 !== 'fixed') {
        this.css('position', 'relative');
        this.css('zIndex', baseIndex);
      }
      if ((_ref2 = $wrap.css('position')) !== 'relative' && _ref2 !== 'absolute' && _ref2 !== 'fixed') {
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
      bmUpdate = function(width, height) {
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
        $navinext.on('click', function() {
          return _this.trigger('bm:next');
        });
        $naviprev.on('click', function() {
          return _this.trigger('bm:prev');
        });
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
          for (i = _i = 0; 0 <= $page ? _i < $page : _i > $page; i = 0 <= $page ? ++_i : --_i) {
            $pagewrap.append(($('<div>')).addClass(opts.pagination.jumpClass).attr('data-bm-index', i).append($('<a>')));
          }
          $pagejump = this.find("." + opts.pagination.jumpClass);
        }
        $pagejump.on('click', function(event) {
          var index;
          index = parseInt(($(event.currentTarget)).attr('data-bm-index'), 10);
          return _this.trigger('bm:jump', {
            page: index
          });
        });
        $pagewrap.css('zIndex', baseIndex + 3);
      }
      bmUpdate(opts.width, opts.height);
      this.css({
        display: 'block',
        visibility: 'visible'
      });
      bindCssSupport = function() {
        var animation, prefix, transform;
        if (opts.cssSupport && (prefix = _this.data('bm:prefix'))) {
          transform = "" + prefix + "Transition";
          animation = 'cubic-bezier(0.215, 0.610, 0.355, 1.000)';
          return $ul.css(transform, "margin-left " + (opts.time / 1000) + "s " + animation);
        }
      };
      unbindCssSupport = function() {
        var prefix, transform;
        if (opts.cssSupport && (prefix = _this.data('bm:prefix'))) {
          transform = "" + prefix + "Transition";
          return $ul.css(transform, '');
        }
      };
      this.on('bm:last', function(event, data) {
        return _this.trigger('bm:jump', {
          page: $page - 1
        });
      });
      this.on('bm:first', function(event, data) {
        return _this.trigger('bm:jump', {
          page: 0
        });
      });
      this.on('bm:next', function(event, data) {
        var next;
        next = (_this.data('bm:current')) + 1;
        if ($page - 1 < next) {
          next = 0;
        }
        return _this.trigger('bm:jump', {
          page: next
        });
      });
      this.on('bm:prev', function(event, data) {
        var next;
        next = (_this.data('bm:current')) - 1;
        if (0 > next) {
          next = $page - 1;
        }
        return _this.trigger('bm:jump', {
          page: next
        });
      });
      this.on('bm:jump', function(event, data) {
        var $next, $prev, events, jump, next, page, prefix, prev, _j, _len;
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
        for (_j = 0, _len = $pagejump.length; _j < _len; _j++) {
          jump = $pagejump[_j];
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
      });
      if (opts.touchSupport) {
        this.on('touchstart', function(event) {
          var touches;
          event.stopPropagation();
          touches = event.originalEvent.touches[0];
          _this.data('bm:touchstartx', touches.pageX);
          _this.data('bm:touchstarty', touches.pageY);
          _this.data('bm:touchstart', parseInt($ul.css('marginLeft'), 10));
          return unbindCssSupport();
        });
        this.on('touchmove', function(event) {
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
        });
        this.on('touchend', function(event) {
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
              return _this.trigger('bm:next');
            }
            return _this.trigger('bm:last');
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
        });
      }
      prewidth = opts.width;
      this.on('bm:update', function(event) {
        var height, width;
        width = _this.width();
        if (prewidth === width) {
          return;
        }
        height = width * (opts.height / opts.width);
        prewidth = width;
        return bmUpdate(width, height);
      });
      window.setTimeout(function() {
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
      });
      return this;
    };
  })(jQuery);

}).call(this);
