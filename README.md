# jquery.boardmaker

  slide plug-in for jQuery

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

# license

  MIT
