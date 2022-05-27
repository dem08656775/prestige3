
let layer = 0;

let data = {
	coins: new Decimal(0),
	prestiges: (()=>{
		let a=[];
		for (let x = 0; x < 10; x++) {
			a[x] = [];
			for (let y = 0; y < 10; y++) {
				a[x][y] = [];
				for (let z = 0; z < 10; z++) {
					a[x][y][z] = new Decimal(0);
				}
			}
		}
		return a;
	})(),
	boughts: (()=>{
		let a=[];
		for (let x = 0; x < 10; x++) {
			a[x] = [];
			for (let y = 0; y < 10; y++) {
				a[x][y] = [];
				for (let z = 0; z < 10; z++) {
					a[x][y][z] = new Decimal(0);
				}
			}
		}
		return a;
	})(),
	mboughts: (()=>{
		let a=[];
		for (let x = 0; x < 10; x++) {
			a[x] = [];
			for (let y = 0; y < 10; y++) {
				a[x][y] = [];
				for (let z = 0; z < 10; z++) {
					a[x][y][z] = new Decimal(0);
				}
			}
		}
		return a;
	})()
};

let metaBonus = 1;

let names = [
	"nano",
	"micro",
	"mini",
	"small",
	"partial",
	"full",
	"multi",
	"hyper",
	"ultra",
	"final"
];

let descriptions;

function resetCheck() {
    if (localStorage.RESET_3) {
        data = {
            coins: 0,
            prestiges: (()=>{
                let a=[];
                for (let x = 0; x < 10; x++) {
                    a[x] = [];
                    for (let y = 0; y < 10; y++) {
                        a[x][y] = [];
                        for (let z = 0; z < 10; z++) {
                            a[x][y][z] = 0;
                        }
                    }
                }
                return a;
            })(),
						boughts: (()=>{
                let a=[];
                for (let x = 0; x < 10; x++) {
                    a[x] = [];
                    for (let y = 0; y < 10; y++) {
                        a[x][y] = [];
                        for (let z = 0; z < 10; z++) {
                            a[x][y][z] = 0;
                        }
                    }
                }
                return a;
            })(),

        };
        localStorage.removeItem("RESET_3");
    }
    return false;
}

function getPPBonus() {
    if (localStorage.PP) {
        let temp = JSON.parse(localStorage.PP).prestiges;
        var out = 1;
        temp.forEach(function (el) {
            out *= 1+el;
        });
        return out;
    }
    return 1;
}

function getGain(a,b,c) {
	let gain = new Decimal(1);
	for (let x = a; x < 10; x++) {
		for (let y = b; y < 10; y++) {
			for (let z = c; z < 10; z++) {
				if(x+y+z!=a+b+c){
					gain = gain.mul(data.prestiges[x][y][z].add(1));
					gain = gain.mul(data.boughts[x][y][z].pow_base(x+2*y+3*z+1))
					gain = gain.mul(data.mboughts[x][y][z].pow_base(x*y*z+1))
				}
			}
		}
	}
	return gain.sub(1)
}

function getRequirement(x,y,z) {
	if (x===0 && y===0 && z===0) {
		return data.boughts[0][0][0].pow_base(1.5).mul(10).floor();
	} else {
		return data.boughts[x][y][z].add(1).pow_base(0.01*x+0.1*y+z+1.5).floor();
	}
}

function canActivatePrestige(x,y,z) {
	if (x===0 && y===0 && z===0) {
		return (data.coins.gte(getRequirement(x,y,z)));
	}
	let s = new Decimal(0)

	if (x!=0) s = s.add(data.boughts[x-1][y][z]);
	if (y!=0) s = s.add(data.boughts[x][y-1][z]);
	if (z!=0) s = s.add(data.boughts[x][y][z-1]);

		if(s.gte(getRequirement(x,y,z))){
			activatePrestige(x,y,z,1)
			return true;
		}

	return false;
}

function activatePrestige(x,y,z,p) {
	//console.log(x,y,z);
	if (true) {

		let cost = Decimal.sumGeometricSeries(p,getRequirement(x,y,z),0.01*x+0.1*y+z+1.5,0).floor()

		if(x+y+z==0)data.coins = data.coins.sub(cost);
		else{
			if (x!=0) {
				let sp = data.boughts[x-1][y][z].min(cost)
				data.boughts[x-1][y][z] = data.boughts[x-1][y][z].sub(sp);
				cost = cost.sub(sp)
			}
			if (y!=0) {
				let sp = data.boughts[x][y-1][z].min(cost)
				data.boughts[x][y-1][z] = data.boughts[x][y-1][z].sub(sp);
				cost = cost.sub(sp)
			}
			if (z!=0) {
				let sp = data.boughts[x][y][z-1].min(cost)
				data.boughts[x][y][z-1] = data.boughts[x][y][z-1].sub(sp);
				cost = cost.sub(sp)
			}
		}
		data.prestiges[x][y][z] = data.prestiges[x][y][z].add(p);
		data.boughts[x][y][z] = data.boughts[x][y][z].add(p);
		data.mboughts[x][y][z] = data.mboughts[x][y][z].max(data.boughts[x][y][z]);
		updateDescriptionsAndNames();
		draw();
		return true;
	}
	draw();
	return false;
}

function update() {
	data.coins = data.coins.add((getGain(0,0,0).add(1)).mul(data.prestiges[0][0][0].add(1)));

	for (let x = 0; x < 10; x++) {
		for (let y = 0; y < 10; y++) {
			for (let z = 0; z < 10; z++) {

				let s = new Decimal(0)

				if (x!=0) s = s.add(data.boughts[x-1][y][z]);
				if (y!=0) s = s.add(data.boughts[x][y-1][z]);
				if (z!=0) s = s.add(data.boughts[x][y][z-1]);

				if(x+y+z==0) s = data.coins;

				let n = Decimal.affordGeometricSeries(s,getRequirement(x,y,z),0.01*x+0.1*y+z+1.5,0);
				activatePrestige(x,y,z,n)
				data.prestiges[x][y][z] = data.prestiges[x][y][z].add(getGain(x,y,z));
			}
		}
	}



    resetCheck();
	localStorage.OH_NO= JSON.stringify(data);
}

function draw() {
	document.getElementById("coins").innerHTML = data.coins;
	document.getElementById("layer").innerHTML = layer;
	document.getElementById("gain").innerHTML = getGain();
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			let btn = document.getElementById("tier"+i+j);
			btn.innerHTML = "Tier\n("+i+","+j+","+layer+")\nx"+data.prestiges[i][j][layer].toFixed(4)+"\nbought:"+data.boughts[i][j][layer]+"\nmbought:"+data.mboughts[i][j][layer];
		}
	}
}

function updateDescriptionsAndNames() {
	descriptions = (()=>{
		let a=[];
		for (var x = 0; x < 10; x++) {
			a[x] = [];
			for (var y = 0; y < 10; y++) {
				a[x][y] = "Tier("+x+","+y+","+layer+"): "+names[x]+names[y]+names[layer]+"prestige\r\nPrestige requirements:";
				if (x===0 && y===0 && layer===0) {
					a[x][y] += "\r\n" + getRequirement(x,y,layer) + " coins";
				}else{
					a[x][y] += "\r\n" + getRequirement(x,y,layer) + " boughts of";
				}
				if (x!==0) {
					a[x][y] += "\r\n" + " tier("+(x-1)+","+y+","+layer+")";
				}
				if (y!==0) {
					a[x][y] += "\r\n" + " tier("+x+","+(y-1)+","+layer+")";
				}
				if (layer!==0) {
					a[x][y] += "\r\n" + " tier("+x+","+y+","+(layer-1)+")";
				}
			}
		}
		return a;
	})()
}

window.addEventListener("load",function () {
	if (localStorage.OH_NO) {
		//data = JSON.parse(localStorage.OH_NO)
	}
	if (localStorage.META) {
		metaBonus = JSON.parse(localStorage.META).multiForOthers;
	}
	let table = document.getElementById("buyables");
	updateDescriptionsAndNames();
	for (let i = 0; i < 10; i++) {
		let tr = document.createElement("tr");
		for (let j = 0; j < 10; j++) {
			let td = document.createElement("td");
			let btn = document.createElement("button");
			btn.id = "tier"+i+j;
			btn.addEventListener("click", ((x,y)=>{return (()=>{
				activatePrestige(x,y,layer);
				document.getElementById("tooltip").innerText = descriptions[x][y];
			})})(i,j));
			btn.addEventListener("mouseover", (e)=>{
				let tooltip = document.getElementById("tooltip");
				tooltip.style.display = "block";
				tooltip.style.top = (e.currentTarget.getBoundingClientRect().top+50)+"px";
				tooltip.style.left = (e.currentTarget.getBoundingClientRect().left+20)+"px";
				tooltip.style.bottom = "";
				tooltip.style.right = "";
				tooltip.innerText = descriptions[parseInt(e.currentTarget.id[4])][parseInt(e.currentTarget.id[5])];
				if (tooltip.getBoundingClientRect().bottom > window.innerHeight) {
					tooltip.style.top = "";
					tooltip.style.bottom = (window.innerHeight-(e.currentTarget.getBoundingClientRect().bottom-50))+"px";
				}
				if (tooltip.getBoundingClientRect().right > window.innerWidth) {
					tooltip.style.left = "";
					tooltip.style.right = (window.innerWidth-(e.currentTarget.getBoundingClientRect().right-50))+"px";
				}
			});
			btn.addEventListener("mouseout", (e)=>{document.getElementById("tooltip").style.display = "none"});
			td.appendChild(btn);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	document.getElementById("layer_prev").addEventListener("click", function(){
		if (layer > 0) {
			layer--;
			updateDescriptionsAndNames();
			draw();
		}
	});
	document.getElementById("layer_next").addEventListener("click", function(){
		if (layer < 9) {
			layer++;
			updateDescriptionsAndNames();
			draw();
		}
	});
	draw();
	setInterval(function () {
		update();
		draw();
	}, 1000);
	//console.log("interval loaded")
})
