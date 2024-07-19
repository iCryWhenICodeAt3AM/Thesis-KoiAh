function hideTrigger(rule){
    if(rule){
        document.getElementById("koiSize").style = "display: block;";
        document.getElementById("pondRecommend1").style = "display: block;";
        document.getElementById("pondRecommend2").style = "display: none;";
    }else { 
        document.getElementById("koiSize").style = "display: none;";
        document.getElementById("pondRecommend1").style = "display: none;";
        document.getElementById("pondRecommend2").style = "display: block;";
    }
}