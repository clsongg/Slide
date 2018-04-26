/*
1. 슬라이드 1,2,3 위치잡기
2. 페이징 클릭
3. 왼쪽 오른쪽 클릭(m4.idxManager 사용)
4. 타이머 추가(m4.Timer 사용)
*/
var m4 = m4 || {};
m4.hasJqueryObject = function($elem){return $elem.length > 0;};
// Index Manager
// add - m4.idxManager.add({ id: String, len: Number, isNext: Boolean });
// get - m4.idxManager.find(id).getIndex(value);
// set - m4.idxManager.find(id).setIndex(value);
// reset - m4.idxManager.find(id).reset();
// get Length - m4.idxManager.find(id).getLength();
// set Length - m4.idxManager.find(id).setLength(value);
m4.idxManager = new function(){
	var _that = this;
	_that.hash = {};
	_that.arrAll = [];

	_that.add = function(obj){
		function Indexing(_id, _len, _isNext){
			var len = _len;
			var count = 0;
			var isNext = _isNext;
			return {
				getIndex: function(value){
					if(value === undefined) return count;
					count += value;
					if(isNext){
						if(count >= len) count = 0;
						else if(count < 0) count = len - 1;
					} else{
						if(count >= len) count = len;
						else if(count < 0) count = 0;
					}
					return count;
				},

				setIndex: function(value){
					count = value;
					return count;
				},

				getLength: function(){
					return len;
				},

				setLength: function(value){
					len = value;
					return len;
				},

				reset: function(){
					count = 0;
				}
			};
		}
		var indexing = new Indexing(obj.id, obj.len, obj.isNext);
		return _that.hash[obj.id] = indexing, _that.arrAll.push(indexing), _that;
	};

	_that.find = function(obj){
		return _that.hash[obj];
	};

	_that.all = function(){
		return _that.arrAll;
	};

	_that.getID = function(){
		return _that.hash;
	};
};

// TimerManager
// Object - id, end, success, removeCount
// id : String
// end : Number
// success : function
// removeCount : number
// m4.timerManager.add({ id: , end: , success: , removeCount:  });
// m4.timerManager.start();
window.requestAnimatedFrame = (function (){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();

m4.timerManager = new function (){
	var _that = this;
	_that.hashMap = {};
	_that.all = [];
	var count = 0;
	var isStop = false;
	var fps = 60;

	_that.add = function(obj){
		function CustomSetTimeOut($id, $ended, $successFunc, $removedCount){
			var _id = $id;
			var elapsed = 0;
			var ended = $ended;
			var isAutoplay = true;
			var removedCount = $removedCount || -1;
			var counter = 0;
			return {
				id: function(){
					return $id;
				},

				call: function(){
					counter += 1;
					if (counter < $removedCount){
						m4.timerManager.ins().remove($id);
						return;
					}
					if (isAutoplay){
						if (++elapsed >= ended){
							$successFunc(_id, counter - 1);
							elapsed = 0;
						}
					}
				},

				auto: function(){
					if (arguments.length){
						isAutoplay = arguments[0];
						elapsed = 0;
					} else{
						return isAutoplay;
					}
				},

				reset: function(){
					elapsed = 0;
				}
			};
		}
		var ticker = new CustomSetTimeOut(obj["id"], obj["end"], obj["success"], obj["removeCount"]);
		_that.hashMap[obj["id"]] = ticker;
		_that.all.push(ticker);
	};

	_that.find = function (id){
		return _that.hashMap[id];
	};

	_that.remove = function (id){
		_that.all.splice(_that.all.indexOf(_that.hashMap[id]), 1);
		_that.hashMap[id] = null;
	};

	_that.start =  function (){
		requestAnimatedFrame(enterFrame);
	};

	function enterFrame(){
		count += 1;
		if (count >= fps){
			var i = -1, length = _that.all.length;
			count = 0;
			while (++i < length){
				_that.all[i].call();
			}
		}
		requestAnimatedFrame(enterFrame);
	}
};

m4.slide = new function() {
	this.init = function() {
		//변수처리
		this.slideWrap = $('.slideWrap'); //m4.slide.slideWrap
		this.slide = $('.slide li'); //m4.slide.slide
		this.pagingWrap = $('.pagingWrap'); //m4.slide.pagingWrap
		this.paging = $('.pagingWrap button'); //m4.slide.paging
		this.pagingAuto = $('.pagingAutoWrap button'); //m4.slide.pagingAuto

		//초기화
		this.slideIdx();
		this.handleClickEvent();
	};

	//슬라이드 인덱스 넣기
	this.slideIdx = function() {
		this.slideWrap.each( function(idx) {
			$(this).attr('data-slide-idx', idx).find(m4.slide.paging).each( function(_idx) {
				$(this).attr('data-idx', _idx);
			});
			var slideLength = $(this).find(m4.slide.slide).length;
			//처음 슬라이드에 클래스값 주기/위치잡기
			$(this).find(m4.slide.slide).eq(0).css('left', 0);
			$(this).find(m4.slide.paging).eq(0).addClass('on');
			//인덱스 매니저 추가
			m4.idxManager.add({ id: 'slideWrap' + idx ,len: slideLength, isNext: true });
			m4.timerManager.add({ id: 'slideWrap' + idx , end: 1 , success: function() {m4.slide.slideWrap.eq(idx).find('.btnNext').trigger('click');}, removeCount: 1 });//removeCount?
		});
		m4.timerManager.start();
	};

	this.handleClickEvent = function() {
		var slideIdxCheck;
		var clickNum;

		//왼쪽 오른쪽 버튼 클릭 시 이벤트
		$('.btnPrev, .btnNext').on( 'click', function() {
			slideIdxCheck = $(this).parent(m4.slide.slideWrap).attr('data-slide-idx');//부모 슬라이드 인덱스값
			clickNum = parseInt(m4.slide.slideWrap.eq(slideIdxCheck).find(m4.slide.pagingWrap).find('.on').attr('data-idx'));//현재 on되어있는 페이징 인덱스값

			if($(this).hasClass('btnPrev')) {
				clickNum = m4.idxManager.find('slideWrap' + slideIdxCheck).getIndex(-1);
				m4.slide.handlePageFunc(slideIdxCheck, clickNum, 'btnPrev');
			}else if($(this).hasClass('btnNext')) {
				clickNum = m4.idxManager.find('slideWrap' + slideIdxCheck).getIndex(+1);
				m4.slide.handlePageFunc(slideIdxCheck, clickNum, 'btnNext');
			}
		});

		//페이징 버튼 클릭 시 이벤트
		this.paging.on( 'click', function() {
			slideIdxCheck = $(this).parent().parent(m4.slide.slideWrap).attr('data-slide-idx');//부모 슬라이드 인덱스값
			clickNum = parseInt($(this).attr('data-idx'));//페이징 클릭한 값 인덱스
			m4.slide.handlePageFunc(slideIdxCheck, clickNum, 'Page');
		});

		//페이징 자동
		this.pagingAuto.on( 'click', function() {
			slideIdxCheck = $(this).parent().parent(m4.slide.slideWrap).attr('data-slide-idx');//부모 슬라이드 인덱스값
			m4.timerManager.remove('slideWrap' + slideIdxCheck);
			console.log('slideWrap' + slideIdxCheck);
		});
	};

	//슬라이드 애니메이션
	this.handlePageFunc = function(slideIdxCheck, clickNum, btnPage) {
		var prevClick = m4.slide.slideWrap.eq(slideIdxCheck).find(this.pagingWrap).find('.on').attr('data-idx');//현재 on되어있는 페이징 인덱스값이 이전값
		var currentClick = m4.slide.slideWrap.eq(slideIdxCheck).find(this.paging).eq(clickNum).attr('data-idx');//+1, -1 되어서 들어온 값 or 페이징 클릭한 값이 현재값
		if(btnPage == 'btnNext' || (btnPage == 'Page') && (prevClick !== currentClick && prevClick < currentClick) || btnPage == '') {
			slideFunc(1);
		}else if(btnPage == 'btnPrev' || (btnPage == 'Page') && (prevClick !== currentClick && prevClick > currentClick)) {
			slideFunc(-1);
		}

		function slideFunc(plusminusSet) {
			m4.idxManager.find('slideWrap' + slideIdxCheck).setIndex(clickNum);//받아온 clickNum setIndex로 다시 설정
			m4.slide.slideWrap.eq(slideIdxCheck).find(m4.slide.slide).eq(clickNum).css('left', (100 * plusminusSet + '%')).stop().animate({left : 0	}, 300);
			m4.slide.slideWrap.eq(slideIdxCheck).find(m4.slide.slide).eq(prevClick).stop().animate({left : (-100 * plusminusSet + '%')}, 300);
		}

		//페이징 on
		m4.slide.slideWrap.eq(slideIdxCheck).find(m4.slide.paging).eq(clickNum).siblings().removeClass('on');
		m4.slide.slideWrap.eq(slideIdxCheck).find(m4.slide.paging).eq(clickNum).addClass('on');
	};
};

$( function() {
	m4.slide.init();
});