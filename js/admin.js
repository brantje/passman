$(document).ready(function(){
  $(document).on('click','.regenerateShareKeys',function(e){
    e.preventDefault();
    $.get(OC.generateUrl('apps/passman/generatesharekeys'),function(r){
      console.log(r);
    });
  });
});