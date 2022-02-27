//实验1程序(59LYH_2DRand.js)

var MaxNumSquares = 20000;	//最多支持1000个正方形
//顶点数，每个正方形含2个正方形，即6个顶点
var MaxNumVertices = MaxNumSquares * 6;
var HalfSize = 1.0;	//正方形边长的一半
var count = 0;		//正方形数目
var canvas;			//canvas元素
var gl;				//WebGL上下文
var drawRect=false;


var choose = 0; 
var lastCount=[];
var lastcountNum=0;

var k = 0;

//页面加载完成后调用此函数，函数名任意（不一定为main）
window.onload = function main()
	{
		//获取页面中id为webgl的canvas元素
		canvas = document.getElementById("webgl");
		if(!canvas)//获取失败？
		{
			alert("获取canvas元素失败！");
			return;
		}
		
		//利用辅助程序文件中的功能获取WebGL上下文
		//成功则后面可通过gl来调用WebGL的函数
		gl = WebGLUtils.setupWebGL(canvas);
		if(!gl)//失败则弹出信息
		{
			alert("获取WebGL上下文失败！");
			return;
		}

		/*设置WebGL相关属性*/
		//设置视口（此处视口占满整个canvas）
		gl.viewport(0,//视口左边界距离canvas左边界距离
					0,//视口下边界距离canvas上边界距离
					canvas.width,//视口宽度
					canvas.height);//视口高度
		gl.clearColor(0.9,0.9,0.9,1.0);//设置背景色为黑色
		//gl.clearColor(1.0,1.0,1.0,1.0);//设置背景色为白色
		
		/*加载shader程序并为shader中attribute变量提供数据*/
		//加载id分别为"vertex-shader"和"fragment-shader"的shader程序
		//并进行编译和链接，返回shader程序对象program
		var program = initShaders(gl,"vertex-shader","fragment-shader")	;
		gl.useProgram(program);	//启用该shader程序对象
		
		/*buffer初始化*/
		var dataBufferId = gl.createBuffer();//创建buffer
		//将id为verticesBufferId的buffer绑定为当前Array Buffer
		gl.bindBuffer(gl.ARRAY_BUFFER,dataBufferId);
		//为当前Array Buffer提供数据，传输到GPU
		gl.bufferData(gl.ARRAY_BUFFER,	//Buffer类型
				Float32Array.BYTES_PER_ELEMENT * 6 * MaxNumVertices,//Buffer数据来源，flatten将points转换为GPU可接受的格式
				gl.STATIC_DRAW);		//表明将如何使用Buffer（STATIC_DRAW表明是一次提供数据，多遍绘制）
		
		/*为shader属性变量与buffer数据建立关联*/
		//获取名称为"a_Position"的shader attribute变量的位置
		var a_Position = gl.getAttribLocation(program,"a_Position");
		if(a_Position < 0)//getAttribLocation获取失败则返回-1
		{
			alert("获取attribute变量a_Position失败！");
			return;
		}
		
		//指定利用当前Array Buffer为a_Position提供数据具体方式
		gl.vertexAttribPointer(a_Position,//shader attribute变量位置
			3,			//每个顶点属性有2个分量
			gl.FLOAT,	//数组数据类型（浮点型）
			false,		//不进行归一化处理
			Float32Array.BYTES_PER_ELEMENT * 6,//相邻顶点属性首址间隔
			0);			//第一个顶点属性在Buffer中偏移量为0字节
		gl.enableVertexAttribArray(a_Position);//启用顶点属性数组	
		
		/*为shader属性变量与buffer数据建立关联*/
		//获取名称为"a_Color"的shader attribute变量的位置
		var a_Color = gl.getAttribLocation(program,"a_Color");
		if(a_Color < 0)//getAttribLocation获取失败则返回-1
		{
			alert("获取attribute变量a_Color失败！");
			return;
		}
		//指定利用当前Array Buffer为a_Position提供数据具体方式
		gl.vertexAttribPointer(a_Color,//shader attribute变量位置
			3,			//每个顶点属性有2个分量
			gl.FLOAT,	//数组数据类型（浮点型）
			false,		//不进行归一化处理
			Float32Array.BYTES_PER_ELEMENT * 6,	//相邻顶点属性首址间隔
			Float32Array.BYTES_PER_ELEMENT * 3);//第一个顶点属性在Buffer中偏移量
		gl.enableVertexAttribArray(a_Color);//启用顶点属性数组		
		
		//获取uniform变量u_matMVP的位置
		var u_matMVP = gl.getUniformLocation(program,"u_matMVP");
		if(!u_matMVP)
		{
			alert("获取uniform变量u_matMVP失败！");
		}
		//指定视域体和投影方式（正交投影），返回投影矩阵
		var matProj = ortho2D(0, canvas.width, 0, canvas.height);	
		//为uniform变量u_matMVP传值
		gl.uniformMatrix4fv(u_matMVP, false, flatten(matProj));
		
		
		
		//电池
		var power = document.getElementById("Power");
		if(!power)
		{
			alert("获取按钮元素Power失败！");
		}
		power.onclick = function()
		{
			choose = 1;
		};
		//电阻
		var resistance = document.getElementById("Resistance");
		if(!resistance)
		{
			alert("获取按钮元素Resistance失败！");
		}
		resistance.onclick = function()
		{
			choose = 2;
		};
		//开关
		var openclose = document.getElementById("OpenClose");
		if(!openclose)
		{
			alert("获取按钮元素OpenClose失败！");
		}
		openclose.onclick = function()
		{
			choose = 3;
		};
		//小灯泡
		var light = document.getElementById("Light");
		if(!light)
		{
			alert("获取按钮元素Light失败！");
		}
		light.onclick = function()
		{
			choose = 4;
		};
		//导线
		var line = document.getElementById("Line");
		if(!line)
		{
			alert("获取按钮元素Line失败！");
		}
		line.onclick = function()
		{
			choose = 5;
		};
		
		
		
		
		gl.clear(gl.COLOR_BUFFER_BIT);	//用背景色擦除窗口内容

		
		canvas.onclick=function()
		{
			switch(choose)
			{
			case 0:
				alert("请选择需要绘画的元件！");
			
				break;
			case 1:
				addP(event.clientX,event.clientY);
				break;
			case 2:
				addR(event.clientX,event.clientY);
				break;
			case 3:
				addO(event.clientX,event.clientY);
				break;
			case 4:
				addL(event.clientX,event.clientY);
				break;
			case 5:
				addSquare(event.clientX,event.clientY);
				canvas.onmousemove=function()
				{
					if(drawRect)
						addSquare(event.clientX,event.clientY);
				}
				break;
			}	
		};
		
		
		// 为canvas添加鼠标键按下事件监听器
		canvas.onmousedown = function()
		{
			if(event.button == 0) // 鼠标左键？
				drawRect = true;
		};
		// 为canvas添加鼠标键弹起事件监听器
		canvas.onmouseup = function()
		{
			if(event.button == 0) // 鼠标左键？
			drawRect = false;
		};
		// 为canvas添加鼠标移动事件监听器
		//canvas.onmousemove = function()
		//{
		//	if(drawRect)
		//	addSquare(event.clientX, event.clientY);
		//};
	};
	
//绘制函数，参数为WebGL上下文
function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);//用背景色擦除窗口内容
	//使用顶点数组进行绘制
	gl.drawArrays(gl.TRIANGLES,//绘制图元类型为点
			0,	//从第0个顶点属性数据开始绘制
			count * 6);	//使用顶点个数等于顶点数组长度
			
			
}
	
//添加一个正方形的顶点数据
//x,y为页面窗口坐标系下的坐标
function addSquare(x,y)		//到上限则不再添加
{
	
	//获取canvas在页面窗口坐标系下的矩形
	var rect = canvas.getBoundingClientRect();
	//从页面客户区窗口坐标转换为WebGL建模坐标
	x = x - rect.left;
	y = canvas.height - (y - rect.top);
	
	
	var vertices = [ //新Square的顶点数据（须和颜色数据一样是三维的）
			vec3(x - HalfSize, y + HalfSize,0), //左上
			vec3(x - HalfSize, y - HalfSize,0), //左下
			vec3(x + HalfSize, y - HalfSize,0), //右上
		
			vec3(x - HalfSize, y + HalfSize,0), //左上
			vec3(x + HalfSize, y - HalfSize,0), //右下
			vec3(x + HalfSize, y + HalfSize,0) //左上
		
		];
	
	//随机得到新正方形的颜色
	//var randColor = vec3(Math.random(),Math.random(),Math.random());
	var randColor=vec3(0,0,0);
	var colors=[
		randColor[0],randColor[1],randColor[2],randColor[0],
		randColor[2],randColor[3]];
	
	var data = []; //新Square的坐标和颜色数据（交织在一起）
	for(var i = 0;i < 6; i ++)
	{
		data.push(vertices[i]);
		data.push(randColor);
	}
	vertices.length = 0;//清空vertices数组
	
	//加载顶点位置数据（含坐标和颜色）
	gl.bufferSubData(gl.ARRAY_BUFFER,
		count * 6 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT,//偏移量
		flatten(data));
	data.length = 0;//清空data数组
	
	lastCount[lastcountNum++]=count;
	count ++;	//正方形数目加一
	
	requestAnimFrame(render)	//请求刷新显示
}	
	
function addR(x,y)
{
	//获取canvas在页面窗口坐标系下的矩形
	var rect=canvas.getBoundingClientRect();
	//从页面客户区窗口坐标转换为WebGL建模坐标
	x = x - rect.left;
	y = canvas.height - (y - rect.top);
	
	var vertices = [ //左上 左下 右下     左上 右下 右上
			vec3(-30,5,0),vec3(-30,0,0), vec3(30,0,0), 
			vec3(-30,5,0),vec3(30,0,0), vec3(30,5,0), 
			
			vec3(-25,12,0),vec3(-25,5,0), vec3(-20,5,0), 
			vec3(-25,12,0),vec3(-20,5,0), vec3(-20,12,0), 
			
			vec3(20,12,0),vec3(20,5,0), vec3(25,5,0), 
			vec3(20,12,0),vec3(25,5,0), vec3(25,12,0), 
			
			vec3(-15,20,0),vec3(-15,5,0), vec3(15,5,0), 
			vec3(-15,20,0),vec3(15,5,0), vec3(15,20,0)
		];
	
	//随机得到新正方形的颜色
	//var randColor = vec3(Math.random(),Math.random(),Math.random());
	var colors=[
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		
		vec3(100/255,137/255,140/255),vec3(100/255,137/255,140/255),vec3(100/255,137/255,140/255),
		vec3(100/255,137/255,140/255),vec3(100/255,137/255,140/255),vec3(100/255,137/255,140/255)
		];
			   
	var data=[];//新Square的坐标和颜色数据（交织在一起）
	for(var i=0;i<6 * 4;i++){
		data.push(add(vec3(x,y,0),vertices[i]));
		data.push(colors[i]);
	}
	vertices.length = 0;//清空vertices数组
	colors.length=0;
	//加载顶点位置数据（含坐标和颜色）
	gl.bufferSubData(gl.ARRAY_BUFFER,
	count*6*2*3*Float32Array.BYTES_PER_ELEMENT,//偏移量
	flatten(data));
	lastCount[lastcountNum++]=count;
	count+=4;//正方形数目加一

	requestAnimFrame(render);//请求刷新显示
}	
	
function addP(x,y)
{
	//获取canvas在页面窗口坐标系下的矩形
	var rect=canvas.getBoundingClientRect();
	//从页面客户区窗口坐标转换为WebGL建模坐标
	x = x - rect.left;
	y = canvas.height - (y - rect.top);
	
	var vertices = [ //左上 左下 右下     左上 右下 右上
			vec3(-10,40,0),vec3(-10,0,0), vec3(10,0,0), 
			vec3(-10,40,0),vec3(10,0,0), vec3(10,40,0),
			
			vec3(-5,48,0),vec3(-5,40,0), vec3(5,40,0), 
			vec3(-5,48,0),vec3(5,40,0), vec3(5,48,0)
		];
	
	//随机得到新正方形的颜色
	//var randColor = vec3(Math.random(),Math.random(),Math.random());
	var colors=[
		vec3(1,Math.random(),Math.random()),vec3(1,1,Math.random()),
		vec3(1,1,Math.random()),vec3(1,Math.random(),Math.random()),
		vec3(1,1,Math.random()),vec3(1,Math.random(),Math.random()),
		
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		
		];
			   
	var data=[];//新Square的坐标和颜色数据（交织在一起）
	for(var i=0;i<6 * 2;i++){
		data.push(add(vec3(x,y,0),vertices[i]));
		data.push(colors[i]);
	}
	vertices.length = 0;//清空vertices数组
	colors.length=0;
	//加载顶点位置数据（含坐标和颜色）
	gl.bufferSubData(gl.ARRAY_BUFFER,
	count*6*2*3*Float32Array.BYTES_PER_ELEMENT,//偏移量
	flatten(data));
	lastCount[lastcountNum++]=count;
	count+=2;//正方形数目加一

	requestAnimFrame(render);//请求刷新显示
}	
	
function addO(x,y)
{
	//获取canvas在页面窗口坐标系下的矩形
	var rect=canvas.getBoundingClientRect();
	//从页面客户区窗口坐标转换为WebGL建模坐标
	x = x - rect.left;
	y = canvas.height - (y - rect.top);
	
	var vertices = [ //左上 左下 右下     左上 右下 右上
			vec3(-30,5,0),vec3(-30,0,0), vec3(30,0,0), 
			vec3(-30,5,0),vec3(30,0,0), vec3(30,5,0), 
			
			vec3(-25,12,0),vec3(-25,5,0), vec3(-20,5,0), 
			vec3(-25,12,0),vec3(-20,5,0), vec3(-20,12,0), 
			
			vec3(20,12,0),vec3(20,5,0), vec3(25,5,0), 
			vec3(20,12,0),vec3(25,5,0), vec3(25,12,0), 
			
			vec3(-15,22,0),vec3(-15,5,0), vec3(-10,5,0), 
			vec3(-15,22,0),vec3(-10,5,0), vec3(-10,22,0), 
			
			vec3(10,22,0),vec3(10,5,0), vec3(15,5,0), 
			vec3(10,22,0),vec3(15,5,0), vec3(15,22,0),
			
			vec3(8,35,0),vec3(-15,22,0), vec3(-10,22,0), 
			vec3(8,35,0),vec3(-10,22,0), vec3(11,30,0)
		];
	
	//随机得到新正方形的颜色
	//var randColor = vec3(Math.random(),Math.random(),Math.random());
	var colors=[
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		
		vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),
		vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),
		
		vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),
		vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),
		
		vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),
		vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255),vec3(140/255,147/255,140/255)
		];
			   
	var data=[];//新Square的坐标和颜色数据（交织在一起）
	for(var i=0;i<6 * 6;i++){
		data.push(add(vec3(x,y,0),vertices[i]));
		data.push(colors[i]);
	}
	vertices.length = 0;//清空vertices数组
	colors.length=0;
	//加载顶点位置数据（含坐标和颜色）
	gl.bufferSubData(gl.ARRAY_BUFFER,
	count*6*2*3*Float32Array.BYTES_PER_ELEMENT,//偏移量
	flatten(data));
	lastCount[lastcountNum++]=count;
	count+=6;//正方形数目加一

	requestAnimFrame(render);//请求刷新显示
}		
	
function addL(x,y)
{
	//获取canvas在页面窗口坐标系下的矩形
	var rect=canvas.getBoundingClientRect();
	//从页面客户区窗口坐标转换为WebGL建模坐标
	x = x - rect.left;
	y = canvas.height - (y - rect.top);
	
	var vertices = [ //左上 左下 右下     左上 右下 右上
			vec3(-30,5,0),vec3(-30,0,0), vec3(30,0,0), 
			vec3(-30,5,0),vec3(30,0,0), vec3(30,5,0), 
			
			vec3(-25,12,0),vec3(-25,5,0), vec3(-20,5,0), 
			vec3(-25,12,0),vec3(-20,5,0), vec3(-20,12,0), 
			
			vec3(20,12,0),vec3(20,5,0), vec3(25,5,0), 
			vec3(20,12,0),vec3(25,5,0), vec3(25,12,0), 
			
			
			
			vec3(-17,30,0),vec3(0,12,0), vec3(17,30,0), 
			vec3(-17,30,0),vec3(17,30,0), vec3(0,45,0),
			
			vec3(-13,39,0),vec3(-13,18,0), vec3(13,18,0), 
			vec3(-13,39,0),vec3(13,18,0), vec3(13,39,0),
			
			vec3(-12,15,0),vec3(-12,5,0), vec3(12,5,0), 
			vec3(-12,15,0),vec3(12,5,0), vec3(12,15,0)
		];
	
	//随机得到新正方形的颜色
	//var randColor = vec3(Math.random(),Math.random(),Math.random());
	var colors=[
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		vec3(Math.random(),Math.random(),Math.random()),vec3(Math.random(),Math.random(),Math.random()),
		
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),vec3(0.4,0.4,0.4),
		
		
		vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),
		vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),
		vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),
		vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),vec3(245/255,245/255,160/255),
	
		vec3(120/255,150/255,140/255),vec3(120/255,150/255,140/255),vec3(120/255,150/255,140/255),
		vec3(120/255,150/255,140/255),vec3(120/255,150/255,140/255),vec3(120/255,150/255,140/255)
		];
			   
	var data=[];//新Square的坐标和颜色数据（交织在一起）
	for(var i=0;i<6 * 6;i++){
		data.push(add(vec3(x,y,0),vertices[i]));
		data.push(colors[i]);
	}
	
	
	
	vertices.length = 0;//清空vertices数组
	colors.length=0;
	//加载顶点位置数据（含坐标和颜色）
	gl.bufferSubData(gl.ARRAY_BUFFER,
	count*6*2*3*Float32Array.BYTES_PER_ELEMENT,//偏移量
	flatten(data));
	lastCount[lastcountNum++]=count;
	count+=6;//正方形数目加一

	requestAnimFrame(render);//请求刷新显示
}	
	
	
	
	
	
	
	
	