/**
 * Programme en quatres (4) grands groupes d'objets considérés de manière séparée: 
 * - les tours (Tower)
 * - les disques (Disk)
 * - l'objet contenant les deux précédents (Hanoi)
 * - l'objet principale, un peu comme une fonction main (Hanoi_Main)
 */
"use strict";
var task = {do:[]};
var to_add;


/*********************************\
/********				************\
\*********************************/
class Tower {

	constructor(name){
		this.name = name;
		this.nb_disks = 0;
		this.positions = []; // position des disques dans la tour avec LIFO
		let $el = $("#tower_"+this.name);
		this.tower_id = $el;
		this.disk_wrap = $el.find(".disk_wrap");
		this.disk_container = $el.find(".disk_container");
	}

	getDisksCount(){
		return this.nb_disks;
	}

	getTopDisk(){
		let n = this.positions.length;
		if (n <= 0){ // no disk so
			return new Disk(NaN);
		} 
		return this.positions[n-1];
	}

	addDisk(disk){
		let top = this.getTopDisk();
		if (top && disk){
			if (top.size <= disk.size){
				console.log("can't add this disk to the tower "+this.name);
				return false;
			}
			else{
				this.positions.push(disk);
				this.nb_disks++;
				this.disk_wrap.find(".hanoi_disk").eq(0).removeClass("top_disk");
				this.disk_wrap.prepend("<div class='hanoi_disk top_disk draggable' style='width:"+disk.size*disk.unity+"px; background-color:"+disk.color+";'></div>").hide().fadeIn();
				this.autoAlign();
				return true;
			}
		}
		else 
		{
			// Pour des besoins de débuggage si erreur
			console.error("Tower::addDisk : non défini");
			console.log("disk : ");	
			console.log(disk);	
			console.log("top : ");	
			console.log(top);	
			console.log("----\n");	
		}
	}

	deleteDisk(){
		if (this.nb_disks > 0){
			this.nb_disks--;
			let disk_poped = this.positions.pop();
			let $to_delete = this.disk_wrap.find(".hanoi_disk").eq(0);
			$to_delete.fadeOut().delay(1000).remove();
			this.autoAlign();
			return disk_poped;
		}
		else{
			console.error("Cannot delete disk. Tower is empty");
		}

	}	

	deleteDisks(){
		this.nb_disks = 0;
		this.positions = [];
		let $to_delete = this.disk_wrap.find(".hanoi_disk");
		$to_delete.remove();
		this.autoAlign();
	}

	/**
	 * Permet d'avoir une structure centrée et alignée des disques niveau design
	 */
	autoAlign(){
		this.disk_container.css({
			"bottom": 20*(this.positions.length-1)+"px"
		});
	}
};


/*********************************\
/******** 	DISQUE    ************\
\*********************************/


class Disk 
{	
	constructor(size){
		this.size = size;
		// taille du disque = unity * size
		this.unity = 50; 
		this.getRandomColor();
	}


	// génération d'un code hexadécimal pseudo-aléatoire pour les couleurs du disque
	getRandomColor(){
		let s = "0123456789ABCDEF";
		this.color = "#";
		let random_index = 0;
		for (let i=0; i < 6; i++){
			random_index = Math.round(Math.random()*(s.length-1));
			this.color = this.color+s[random_index];
		}
	}
};

/*********************************\
/********	HANOI 	  ************\
\*********************************/
class Hanoi 
{
	constructor (nb_disks){
		this.clean();
		this.nb_disks = nb_disks;
		this.moves = 0;
		this.min_moves = Math.pow(2,nb_disks)-1;
		this.tower_source = new Tower("source");
		this.tower_medium = new Tower("medium");
		this.tower_destination = new Tower("destination");
		this.delay = 300;
		this.verbose = true;

		// create disk to the source tower
		for (let i = this.nb_disks; i>=1; i--) {
			this.tower_source.addDisk(new Disk(i));
		}
	}

	clean(){
		if (typeof(this.tower_source) != "undefined")
			this.tower_source.deleteDisks();
		if (typeof(this.tower_medium) != "undefined")
			this.tower_medium.deleteDisks();
		if (typeof(this.tower_destination) != "undefined")
			this.tower_destination.deleteDisks();	
	}

	getTower(tower_name){
		switch(tower_name){
			case "source":
				return this.tower_source;
			case "medium":
				return this.tower_medium;
			case "destination":
				return this.tower_destination;
		}
	}

	/**
	 * Effectue la résolution du problème de manière récusive
	 */
	run(source, dest, temp, nb_disks)
	{
		// faire passer N-1 disques sur le pilier intermédiaire; 
		// faire passer le Ni-ème disque sur le pilier final; 
		// faire passer les N-1 disques du pilier intermédaire sur le pilier	
		if(nb_disks == 1)
		{
			this.move(source, dest);
		}
		else
		{
			this.run(source, temp, dest, nb_disks-1);	// ss-problème 1
			this.run(source, dest, temp, 1);				// ss-problème 2
			this.run(temp, dest, source, nb_disks-1);	// ss-problème 3
		}
	}

	move(source, dest)
	{
		this.moves++;
		// **** Trois instructions à faire pour déplacer un disque ***
		// var to_add = this.getTower(source).getTopDisk();
		// this.getTower(source).deleteDisk();
		// this.getTower(dest).addDisk(to_add);	
		// ------ Mis en commentaire pour être stocker et exécuter toutes les 400ms
		task.do.push("to_add = main.hanoi.getTower('"+source+"').deleteDisk();");
		task.do.push("main.hanoi.getTower('"+dest+"').addDisk(to_add);");
		task.do.push("$('#hanoi_score').text("+ this.moves +");");
		if (this.verbose){
			let msg = this.moves+" deplacement de "+source+" vers "+dest+"\n";
			console.log(msg);
		}
	}

	solve()
	{
		let msg = "La tour de Hanoï pour "+this.nb_disks+" nécessitera "+this.min_moves+" opérations à sa résolution";
		if (this.nb_disks < 1 || this.nb_disks > 10)
		{
			console.error(msg);
			swal(msg, "Attention", "error");
		}
		else
		{
			console.log(msg);
			// lance la résolution de la tour de Hanoi déplaçant les disque de la tour "source" 
			// à la tour "destination" par l'intermédiaire de la tour "medium"
			this.run("source", "destination", "medium", this.nb_disks);
			// déplace un disque toutes les this.delay millisecondes puis quitte la boucle
			task.timer_id = window.setInterval(function(){
				let to_do = task.do[0];
				task.do = task.do.slice(1)
				eval(to_do)
				console.log(to_do);
				if (task.do.length == 0)
				{
					window.clearInterval(task.timer_id);
					main.hanoi.gameover();
				}
			}, this.delay);
		}
	}

	gameover(){
		// Vérification de la fin du jeu
		if ((this.tower_source.positions.length == 0) && (this.tower_medium.positions.length == 0) && (this.tower_destination.positions.length == this.nb_disks))
		{
			swal("Game is over", "Et voilà c'est la fin du jeu en "+main.hanoi.moves+" déplacements", "success");
			return true;
		}	
		else 
			return false;
	}
}


/*********************************\
/********	Classe principale (exécuteur)
\*********************************/

class HanoiMain
{
	constructor(nb_disks){
		this.hanoi = new Hanoi(nb_disks);
		if (nb_disks > 10)
		{
			swal("Attention", "Cette partie nécessitera "+this.hanoi.min_moves+" déplacements au minimum", "warning");
			swal("Erreur", "Ce programme n'est prévu que pour les nombres entre 1 et 10", "error")	
		}
		$("#hanoi_score_min").text(this.hanoi.min_moves);
		$("#hanoi_score").text(0);
	}
}

var main = new HanoiMain(3);



/*********************************\
/********				************\
\*********************************/

// objet nous permettant d'accéder sans risques à des variables dans des fonctions
var vars = {
	dropped: false
};
/*********************************\
/********	Utilisation de Jquery
\*********************************/

jQuery(function($) {
	/*********************************\
	/********	Connexion des boutons d'actions de l'interface
	\*********************************/
	$(document).ready(function($) {
		$("#hanoi_play").submit(function(e){
			e.preventDefault();
			let nb_disks = $(this).find("select").val();
			main.hanoi.clean();
			if (nb_disks < 1 || nb_disks > 10)
			{
				let msg = "La tour de Hanoï pour "+nb_disks+" nécessiterait "+(Math.pow(2,nb_disks)-1)+" opérations à sa résolution";
				console.error(msg);
				swal("Attention", msg, "error");
			}
			else
			{
				main = new HanoiMain(parseInt(nb_disks));
			}
		});


		$("#hanoi_solve").click(function(){
			let nb_disks = $("#hanoi_play").find("select").val();
			main.hanoi.clean();
			main.hanoi = new Hanoi(parseInt(nb_disks));
			main.hanoi.solve();
			main.hanoi.gameover();
		});
		$("#hanoi_help").click(function(){
			swal("Instructions du jeu", "Essaie de déplacer tous les disques de la tour source à la tour destination. On ne peut déplacer plus d'un disque à la fois. Un disque ne peut être placer que sur un autre plus grand ou sur un emplacement vide.", "info");
		});	
	});

	/******************************************************\
	/********	Utilisation d'Interact.js (drag and drop)
	\*****************************************************/
	// opérations réalisées en suivant les consignes sur la documentation de la librairie
	var element = document.querySelector(".hanoi_disk.top_disk"),
	    x = 0, y = 0;
	var towers = document.querySelectorAll(".tower_horizontal");

	interact(".hanoi_disk.top_disk")
		.draggable({
			snap: {
				targets: [
				interact.createSnapGrid({ x: 10, y: 10 })
				],
				range: Infinity,
				relativePoints: [ { x: 0, y: 0 } ]
			},
			inertia: false,
			manualStart: false,
			restrict: {
				restriction: towers,
				elementRect: { top: 0, left: 0, bottom: 0, right: 0},
				endOnly: true
			}
		})
		.on('dragmove', function (event) {
			x += event.dx;
			y += event.dy;
			var e = event;
			event.target.style.webkitTransform =
			event.target.style.transform =
			'translate(' + x + 'px, ' + y + 'px)';
		})
		.on("dragstart", function(e){
			e.target.classList.add("is-dragged");
			vars.left = e.target.style.left;
			vars.top = e.target.style.top;
			// console.log(vars);
		})
		.on("dragend", function(e){
			e.target.classList.remove("is-dragged");
			x = y = 0; 
		});

	interact('.tower_horizontal').dropzone({
		// only accept elements matching this CSS selector
		accept: '.top_disk',
		// Require a 75% element overlap for a drop to be possible
		overlap: 0.75,

		// listen for drop related events:

		ondropactivate: function (event) {
			event.relatedTarget.classList.add("is-dragged");
			vars.dropped = false;
			// add active dropzone feedback
			event.target.classList.add('drop-active');
		},
		ondragenter: function (event) {
			var draggableElement = event.relatedTarget,
			dropzoneElement = event.target;

			// feedback the possibility of a drop
			dropzoneElement.classList.add('drop-target');
			draggableElement.classList.add('can-drop');
		},
		ondragleave: function (event) {
			// remove the drop feedback style
			event.target.classList.remove('drop-target');
			event.relatedTarget.classList.remove('can-drop');
		},
		ondrop: function (event) {
			// event.relatedTarget.textContent = 'Dropped';
			let disk = event.relatedTarget;
			let dropped_tower = event.target.parentNode.id;
			let tower_origin = event.relatedTarget.parentNode.parentNode.parentNode.parentNode.id;
			let disk_to_add = main.hanoi.getTower(tower_origin.replace("tower_", "")).deleteDisk();
			let added = main.hanoi.getTower(dropped_tower.replace("tower_", "")).addDisk(disk_to_add);
			if (added)
			{
				if (tower_origin != dropped_tower){
					let new_top_disk = $("#"+tower_origin).find(".hanoi_disk").eq(0).addClass("top_disk");
					main.hanoi.moves++;
					$("#hanoi_score").text(main.hanoi.moves);
					if (main.hanoi.gameover()){
						console.log("End of the game");
						// passage au niveau suivant
						main.hanoi.clean();
						main.hanoi = new Hanoi(parseInt(main.hanoi.nb_disks+1));
						$('#hanoi_play').find("select option[selected='']").removeAttr('selected');
						$('#hanoi_play').find("select option").each(function(index, el) {
							if (el.text == main.hanoi.nb_disks)
								$(this).attr("selected", "");
						});
						$('#hanoi_score').text(0);
						$('#hanoi_score_min').text(main.hanoi.min_moves);
						console.log("Next level");
					}
				}
			}
			else{	
				main.hanoi.getTower(tower_origin.replace("tower_", "")).addDisk(disk_to_add);
			}
			vars.dropped = true;
		},
		ondropdeactivate: function (event) {
			if (!vars.dropped)
			{
				console.log('not dropped');
				let to_add = main.hanoi.getTower(event.target.parentNode.id.replace("tower_", "")).deleteDisk();
				main.hanoi.getTower(event.target.parentNode.id.replace("tower_", "")).addDisk(to_add);
				vars.dropped = true;

			}
			// remove active dropzone feedback
			event.target.classList.remove('drop-active');
			event.target.classList.remove('drop-target');
			event.relatedTarget.classList.remove("is-dragged");
		}
	});
});