###

jquery.boardmaker

* Version: 0.0.6
* Updated: Dec 23th 2013
* Created by geta6

###

(($) ->

  def_opts =
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

  getVendorPrefix = ->
    {style} = document.body or document.documentElement
    transition = 'transition'
    vendor = [ 'Webkit', 'Moz', 'Khtml', 'O', 'ms' ]
    transition = transition.charAt(0).toUpperCase() + transition.substr(1)
    for i in [0...vendor.length]
      return vendor[i] if typeof style[vendor[i] + transition] is 'string'
    return no

  $.extend $.easing,
    easeOutCubic: (x, t, b, c, d) ->
      return c * ( ( t = t / d - 1 ) * t * t + 1) + b

  $.fn.boardmake = (usr_opts = {}) ->

    return if 1 > @size()

    # setup
    # =====

    $initialized = no
    opts = $.extend {}, def_opts, usr_opts

    # dom
    # ---

    $wrap = @find opts.wrap
    $ul = @find opts.ul
    $li = @find opts.li

    if 0 is $wrap.size()
      return console.error "no wrap, boardmaker aborted (#{opts.wrap})"

    if 0 is $ul.size()
      return console.error "no ul, boardmaker aborted (#{opts.ul})"

    # data
    # ----

    @data 'bm:current', opts.index
    @data 'bm:prefix', getVendorPrefix()

    # type
    # ----

    opts.type = 'none' unless opts.type in ['slide', 'none']

    # wrap + item
    # -----------

    baseIndex = parseInt (@css 'zIndex'), 10
    baseIndex = opts.zIndex if isNaN baseIndex
    unless (@css 'position') in ['relative', 'absolute', 'fixed']
      @css 'position', 'relative'
      @css 'zIndex', baseIndex
    unless ($wrap.css 'position') in ['relative', 'absolute', 'fixed']
      $wrap.css 'position', 'relative'
      $wrap.css 'zIndex', baseIndex + 1
    $wrap.css 'overflow', 'hidden'

    $li.each (i, el) ->
      ($ el).attr 'data-bm-index', i
      ($ el).hide() if i isnt opts.start

    # page
    # ----

    @data 'bm:length', $page = $li.size()

    if $page <= opts.index
      opts.index = $page - 1
      @data 'bm:current', $page - 1

    currentWidth = opts.width
    currentHeight = opts.height

    bmUpdate = (width, height) =>
      $wrap.css 'width', currentWidth = width
      $wrap.css 'height', currentHeight = height

      $li.each (i, el) =>
        ($ el).show().css
          margin: "0 #{opts.margin} 0 0"
          padding: 0
          position: 'absolute'
          top: 0
          left: (width + opts.margin) * i
          bottom: 0
          width: width
          height: height

      $ul.css
        position: 'absolute'
        top: 0
        left: 0
        right: 0
        bottom: 0
        marginTop: 0
        marginRight: 0
        marginBottom: 0
        marginLeft: -1 * (width + opts.margin) * @data 'bm:current'
        padding: 0
        width: (width + opts.margin) * ($page + 1)
        zindex: baseIndex + 2

      if 2 > $page
        $navinext.hide()
        $naviprev.hide()

      if 2 > $page
        $pagewrap.hide()

    # navigation
    # ----------

    $navinext = null
    $naviprev = null

    if opts.navigation.active
      $navinext = @find ".#{opts.navigation.nextClass}"
      $naviprev = @find ".#{opts.navigation.prevClass}"
      unless $navinext.size()
        @append $navinext = ($ '<div>').addClass opts.navigation.nextClass
      unless $naviprev.size()
        @append $naviprev = ($ '<div>').addClass opts.navigation.prevClass
      $navinext.on 'click', => @trigger 'bm:next'
      $naviprev.on 'click', => @trigger 'bm:prev'
      $navinext.css 'zIndex', baseIndex + 3
      $naviprev.css 'zIndex', baseIndex + 3

    # pagination
    # ----------

    if opts.pagination.active
      $pagewrap = @find ".#{opts.pagination.wrapClass}"
      $pagejump = @find ".#{opts.pagination.jumpClass}"
      unless $pagewrap.size()
        @append $pagewrap = ($ '<div>').addClass opts.pagination.wrapClass
      unless $pagejump.size()
        for i in [0...$page]
          $pagewrap.append ($ '<div>')
            .addClass(opts.pagination.jumpClass)
            .attr('data-bm-index', i)
            .append ($ '<a>')
        $pagejump = @find ".#{opts.pagination.jumpClass}"
      $pagejump.on 'click', (event) =>
        index = parseInt ($ event.currentTarget).attr('data-bm-index'), 10
        @trigger 'bm:jump', page: index
      $pagewrap.css 'zIndex', baseIndex + 3

    # update
    # ------

    bmUpdate opts.width, opts.height

    @css { display: 'block', visibility: 'visible' }

    # css transition
    # ==============

    bindCssSupport = =>
      if opts.cssSupport and prefix = @data 'bm:prefix'
        transform = "#{prefix}Transition"
        animation = 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        $ul.css transform, "margin-left #{opts.time / 1000}s #{animation}"

    unbindCssSupport = =>
      if opts.cssSupport and prefix = @data 'bm:prefix'
        transform = "#{prefix}Transition"
        $ul.css transform, ''

    # event emitter
    # =============

    @on 'bm:last', (event, data) =>
      @trigger 'bm:jump', page: $page - 1

    @on 'bm:first', (event, data) =>
      @trigger 'bm:jump', page: 0

    @on 'bm:next', (event, data) =>
      next = (@data 'bm:current') + 1
      next = 0 if $page - 1 < next
      @trigger 'bm:jump', page: next

    @on 'bm:prev', (event, data) =>
      next = (@data 'bm:current') - 1
      next = $page - 1 if 0 > next
      @trigger 'bm:jump', page: next

    @on 'bm:jump', (event, data) =>
      data.callback or= ->
      page = data.page
      prev = @data 'bm:current'
      next = page
      prev = 0 if prev is null
      $prev = $li.filter("[data-bm-index=#{prev}]")
      $next = $li.filter("[data-bm-index=#{next}]")
      $pagejump.find('a').removeClass 'active'
      for jump in $pagejump
        jump = $ jump
        if next is parseInt jump.attr('data-bm-index'), 10
          jump.find('a').addClass('active')
      opts.callback.before next if $initialized
      switch opts.type
        when 'slide'
          if opts.cssSupport and prefix = @data 'bm:prefix'
            events = [
              'transitionend'
              'webkitTransitionEnd'
              'oTransitionEnd'
              'otransitionend'
              'MSTransitionEnd'
            ]
            $ul.off events.join ' '
            $ul.on (events.join ' '), ->
              if $initialized
                opts.callback.after next
                data.callback()
            $ul.css
              marginLeft: -1 * (currentWidth + opts.margin) * next
            unless $initialized
              window.setTimeout ->
                data.callback()
              , opts.time
          else
            $ul.stop().animate
              marginLeft: -1 * (currentWidth + opts.margin) * next
            ,
              duration: opts.time
              easing: 'easeOutCubic'
              complete: ->
                opts.callback.after next if $initialized
                data.callback()
        when 'none'
          $ul.stop().css
            marginLeft: -1 * (currentWidth + opts.margin) * next
          opts.callback.after next if $initialized
          data.callback()
      @data 'bm:current', next

    if opts.touchSupport
      @on 'touchstart', (event) =>
        event.stopPropagation()
        touches = event.originalEvent.touches[0]
        @data 'bm:touchstartx', touches.pageX
        @data 'bm:touchstarty', touches.pageY
        @data 'bm:touchstart', parseInt $ul.css('marginLeft'), 10
        unbindCssSupport()

      @on 'touchmove', (event) =>
        event.stopPropagation()
        touches = event.originalEvent.touches[0]
        scrollx = Math.abs touches.pageX - @data 'bm:touchstartx'
        scrolly = Math.abs touches.pageY - @data 'bm:touchstarty'
        @data 'bm:scrolling', scrolling = scrollx < scrolly
        unless scrolling
          touchmove = touches.pageX - @data 'bm:touchstartx'
          $ul.css 'marginLeft', @data('bm:touchstart') + touchmove
          # event.preventDefault()

      @on 'touchend', (event) =>
        event.stopPropagation()
        touches = event.originalEvent.touches[0]
        unless touches
          touches = event.originalEvent.changedTouches[0]
        bindCssSupport()
        diff = touches.pageX - @data 'bm:touchstartx'
        if currentWidth * -0.3 > diff
          return @trigger 'bm:next' if $page - 1 < @data 'bm:current'
          return @trigger 'bm:last'
        if currentWidth *  0.3 < diff
          return @trigger 'bm:prev' if 0 < @data 'bm:current'
          return @trigger 'bm:first'
        @trigger 'bm:jump', page: @data 'bm:current'

    prewidth = opts.width
    @on 'bm:update', (event) =>
      width = @width()
      return if prewidth is width
      height = width * (opts.height / opts.width)
      prewidth = width
      bmUpdate width, height

    # initialize
    # ==========

    window.setTimeout =>
      @trigger 'bm:update'
      @trigger 'bm:jump',
        page: @data 'bm:current'
        callback: ->
          bindCssSupport()
          $initialized = yes
          opts.callback.complete()
      ($ window).on 'resize', => @trigger 'bm:update'

    return @

)(jQuery)
