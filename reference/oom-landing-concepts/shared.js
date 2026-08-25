const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const p=document.querySelector('[data-progress]');addEventListener('scroll',()=>{if(p){const m=document.documentElement.scrollHeight-innerHeight; p.style.transform=`scaleX(${m?scrollY/m:0})`;}},{passive:true});
