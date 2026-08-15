/* Final UI cleanup: remove legacy duplicated premium test toolbar after render. */
(function(){const old=window.renderDenemeler;if(typeof old!=='function'||old.__polished)return;function wrapped(){const r=old.apply(this,arguments);document.querySelectorAll('.premium-testbar').forEach(x=>x.remove());return r;}wrapped.__polished=true;window.renderDenemeler=wrapped;})();
