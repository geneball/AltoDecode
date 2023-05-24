
// htmlui.js
import dayjs from 'dayjs'
import { msg, err } from './msg.js'


export class HUI {
	static gEl( idOrEl ){
		let el = idOrEl
		if ( typeof idOrEl == 'string' )
			el = document.getElementById( idOrEl );
		if ( !(el instanceof HTMLElement )) debugger;
		return el;
	}
	static addListener( elId, evttype, fn ){		// add listener to 'el' for 'evtype', that calls 'fn'
		if (typeof fn != 'function') debugger
		let el = HUI.gEl( elId );
		el.addEventListener( evttype, fn );
	}
	static toggleAllCarets( ){	// expand/collapse 'grp_All' and all other .caret elements correspondingly
		
		let grps = document.getElementsByClassName("caret");
		let grpAll = HUI.gEl( 'grp_All' );
		grpAll.classList.toggle("caret-down");
		let down = grpAll.classList.contains("caret-down");
		for ( let el of grps ){
			if (el != grpAll){
				let grp = el.parentElement.querySelector('.nested');
				if (down){
					if (!el.classList.contains('caret-down')) el.classList.add('caret-down');
					if (!grp.classList.contains("active")) grp.classList.add("active");
				} else {
					if (el.classList.contains("caret-down")) el.classList.remove("caret-down");
					if (grp.classList.contains("active")) grp.classList.remove("active");
				}
			}
		}
	}
	static toggleList( evt ){		// expand/collapse 'evt.tgt'
		let el = evt.target;
		if ( !el || !el.classList.contains('caret') ) debugger;
		
		el.parentElement.querySelector(".nested").classList.toggle("active");
		el.classList.toggle("caret-down");
	}
	static popup( html ){
		let p = HUI.gEl('Popup')
		p.innerHTML = html + '<button id="popupClose"> close </button>'
		p.className = ''
		HUI.addListener( 'popupClose', 'click', ()=>{ HUI.setClass('Popup', 'hide', true )} )
	}
	static newEl( tag, id, cls, txt ){
		if ( tag==undefined ) tag = 'div';
		if ( id==undefined ) id = '';
		if ( cls==undefined ) cls = '';
		if ( txt==undefined ) txt = '';
		
		let el = document.createElement( tag );
		if ( id  != '' ) el.id = id;
		if ( cls != '' ) el.className = cls;
		el.innerText = txt;
		return el;
	}
	static newSel( id, nms, selected ){
		let sel = HUI.newEl('select', id )
		for ( let opt of nms ){
			let nopt = HUI.newOpt( opt )
			if (opt==selected) nopt.selected = true
			sel.appendChild( nopt )
		}
		return sel
	}
	static newOpt( nm ){
		let opt = HUI.newEl('option', '', '', nm )
		opt.value = nm
		return opt
	}
	static hasClass( el, cls ){
		el = HUI.gEl( el )
		return el.classList.contains( cls )
	}
	static setClass( el, cls, enable ){		// 'enable'/disable class 'cls' of element 'el'  enable undefined => toggle
		el = HUI.gEl( el )
		let hascls = el.classList.contains( cls )
		if (enable==undefined) enable = !hascls
		if ( hascls ){
			if (!enable) el.classList.remove( cls );
		} else {
			if (enable) el.classList.add( cls );
		}
	}
	static toggleSel( el ){					// toggle class 'sel' of element 'el'
		el.classList.toggle("sel");
	}
	static loadSelect( sel, nms ){			// load array of 'nms' into html select 'sel'
	  sel = HUI.gEl( sel )
	  if ( !nms instanceof Array ) debugger;
	   var i, L = sel.options.length - 1;
	   for(i = L; i >= 0; i--) {
		  sel.remove(i);
	   }
	   for (var nm of nms){
		var opt = document.createElement('option');
		opt.value = opt.innerHTML = nm;
		sel.appendChild(opt);  
	   }
	   sel.selectedIndex = 0;
	}
	static setExt( fnm, ext ){		// => filename with extension
		fnm = HUI.baseNm( fnm );
		return fnm + ext;
	}
	static baseNm( fnm ){				// => filename without extension
		let idx = fnm.indexOf('.');
		if (idx >= 0) fnm = fnm.substring(0,idx);
		return fnm;
	}
	static isName( tk ){				// => T, if identifier
		let res = tk.match(/^\w+[\d\w]*$/i)
		return res != null
	}	
	static isNumber( tk ){				// => T, if number
		let res = tk.match(/^-*\d*\.?\d+$/i) 
		return res != null
	}
	static getDate(){
		return dayjs().format('D-MMM-YY H:mm')
	}
	static S( v ){ // value as string of up to 4 digits
	  let s = v.toString(), dot = s.indexOf('.')
	  if (dot==1 && s.substring(0,1)=='0') s = s.substring(1)
	  return dot<0? s : s.substring(0,4)
	}
}

export class GUI {
	static guiCnt = 0
	constructor( parId, gnm, str, hide ){
		this.level = 0
		this.idcnt = 0
		this.parId = parId
		this.par = HUI.gEl( parId )
		if ( this.par==null ) 
			err( `GUI: element ${parId} not found` )
		this.nm = str? str : 'G'
		this.id = `gui${GUI.guiCnt}`
		GUI.guiCnt++
		
		let grp = HUI.newEl( 'span', '', 'gui_group', '' )
		this.grpnm = HUI.newEl( 'span', '', `gui_grpnm caret`, this.nm )
		this.bdy = HUI.newEl( 'span', this.id, 'gui_body', '' )
		//grp.appendChild( document.createElement( 'br' ))
		grp.appendChild( this.grpnm )
		grp.appendChild( this.bdy )
		this.par.appendChild( grp )
		this.grpnm.addEventListener( 'click', (evt)=>{ this.setHidden() })
		this.setHidden( hide==undefined? false : hide )	
		this.items = []
	}
	nxtId(){
		this.idcnt++
		return `${this.id}_${this.idcnt}`
	}
	clearGroup(){
		this.bdy.innerHTML = ''
		this.items = []
	}
	setHidden( hide ){	// transition?
		this.hidden = hide===undefined? !this.hidden : hide
		this.bdy.hidden = this.hidden
		HUI.setClass( this.grpnm, 'caret-down', !this.hidden )
		if ( !this.bdy.hidden && typeof this.openFn == 'function' )
			this.openFn( this.grpnm )
	}
	addGroup( nm, str, hide, fn ){
		let gui = new GUI( this.id, nm, str, hide )
		gui.level = this.level+1
		HUI.setClass( gui.grpnm, `glev${gui.level}`, true )
		let id = this.addItem( '', 'gui', nm, gui, true )
		if (hide) gui.setHidden(hide)
		gui.openFn = fn
		return gui
	}
	resetGroup( gui, nm, str, hide, fn ){		// create 'gui' if undefined, or clear it 
		if ( gui == undefined ){ 
			this.addBreak()
			gui = this.addGroup( nm, str, hide, fn )
		}
		gui.clearGroup()
		return gui
	}

	addBreak(){
		this.bdy.appendChild( document.createElement( 'br' ))
	}
	findItm( nm ){
		for ( let itm of this.items )
			if ( itm.nm==nm ) return itm
		return null
	}
	getVal( nm ){
		let itm = this.findItm( nm )
		if ( itm==null ) return null
		let el = HUI.gEl(itm.id)
		switch (itm.typ){
			case 'checkbox':  	return el.checked; break
			//case 'file':		el.parentElement.innerText = val
			default: 			return el.value; break
		}
	}
	setVal( nm, val ){
		let itm = this.findItm( nm )
		if ( itm==null ) return
		let el = HUI.gEl(itm.id)
		switch (itm.typ){
			case 'checkbox':  	el.checked = val; break
			case 'file':		el.parentElement.innerText = val; break
			default: 			el.value = val; break
		}
	}
	showVal( nm, enab ){
		let itm = this.findItm( nm )
		if ( itm==null ) return
		let el = HUI.gEl( itm.id )
		if ( el.parentElement.tagName == 'LABEL' ) el = el.parentElement
		el.hidden = enab==undefined? !el.hidden : enab
	}
	addItem( lbl, typ, str, fn ){
		let id = this.nxtId()
		let nm = lbl
		if (nm=='') nm = str
		let itm = { nm:nm, lbl: lbl, typ: typ, str: str, id: id }
		if ( typeof fn == 'function' ) itm.fn = fn
		this.items.push( itm )
		let lblcls = 'gui'
		
		let el = null
		switch (typ){
			case 'sel': // selector of 'str'=list
				el = HUI.newSel( itm.id, str )
				break
			case 'gui': // fn is actually the new gui
				itm.gui = fn
				el = itm.gui.bdy
				id = el.id
				break
			case 'div':
				el = HUI.newEl( 'span', id, 'gui', str )
				//let pre = HUI.newEl( 'pre', '', '', str )
				//el.appendChild( pre )
				break
			case 'checkbox':
			case 'file':
				lblcls += ' guibx'
				//fall thru
			case 'number':
			case 'button':
			case 'text':
				el = HUI.newEl( 'input', id, 'gui' )
				el.type = typ
				el.value = str
				break
		}
		if ( lbl != '' ){
			let lel = HUI.newEl( 'label', '', lblcls, lbl )
			lel.appendChild( el )
			el = lel
		}

		this.bdy.appendChild( el )
		return id
	}
	addSelector( lbl, filelist, fn  ){
		let id = this.addItem( lbl, 'sel', filelist, fn )
		if (typeof fn == 'function' ) 
			HUI.addListener( id, 'change', (evt)=>{ fn( evt.target.value ) } )
		return id
	}
	addLine( lbl, txt, fn ){
		let id = this.addItem( lbl, 'div', txt, fn )
		if (typeof fn == 'function' ) 
			HUI.addListener( id, 'click', fn )
		return id
	}
	addCategory( nm, cls, fn, enab ){   // checkbox in <div>
		//let id = this.addCheckbox( nm, fn, true )
		let id = this.addItem( nm, 'checkbox', '', fn )
		//this.addBreak()
		
		let lbl = HUI.gEl(id).parentElement
		lbl.className += ' br ' + cls
		if ( typeof fn == 'function' ) 
			HUI.addListener( id, 'click', fn )
	}
	addCheckbox( lbl, fn ){
		let id = this.addItem( lbl, 'checkbox', '', fn )
		if (typeof fn == 'function' ) 
			HUI.addListener( id, 'click', fn )
		return id
	}
	addButton( str, fn ){
		let id = this.addItem( '', 'button', str, fn )
		if (typeof fn == 'function' ) 
			HUI.addListener( id, 'click', fn )
		return id
	}
	addNumber( lbl, val, fn ){
		let id = this.addItem( lbl, 'number', val, fn )
		if (typeof fn == 'function' ) 
			HUI.addListener( id, 'click', fn )
		return id
	}
	addText( lbl, str, fn ){
		let id = this.addItem( lbl, 'text', str, fn )
		if (typeof fn == 'function' ) 
			HUI.addListener( id, 'change', (evt) => { 
				fn( evt.target.value ) } )
		return id
	}
	addFile( lbl, str, fn ){
		let id = this.addItem( lbl, 'file', '', fn )
		let el = HUI.gEl( id )
		if ( str != '' )
			el.accept = str
		if ( typeof fn == 'function' )
			HUI.addListener( id, 'change', (evt) => { 
				fn( evt.target.files ) 
			} )
		return id
	}
}