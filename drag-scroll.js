(function(){
  function initDragScroll(el){
    var down=false,sx=0,sl=0
    el.addEventListener('mousedown',function(e){down=true;sx=e.pageX;sl=el.scrollLeft;el.style.cursor='grabbing';e.preventDefault()})
    window.addEventListener('mouseup',function(){if(down){down=false;el.style.cursor='grab'}})
    el.addEventListener('mouseleave',function(){down=false;el.style.cursor='grab'})
    el.addEventListener('mousemove',function(e){if(!down)return;el.scrollLeft=sl-(e.pageX-sx)})
  }
  function bindAll(){
    document.querySelectorAll('.rev-wrap,.mfbar').forEach(function(el){
      if(!el._dragBound){el._dragBound=true;initDragScroll(el)}
    })
  }
  document.addEventListener('DOMContentLoaded',bindAll)
  new MutationObserver(bindAll).observe(document.documentElement,{childList:true,subtree:true})
})()