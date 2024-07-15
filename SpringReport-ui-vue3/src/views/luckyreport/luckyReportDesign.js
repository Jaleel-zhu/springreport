/*
 * @Description: 
 * @Version: 1.0
 * @Autor: caiyang
 * @Date: 2022-01-22 15:50:34
 * @LastEditors: caiyang caiyang90@163.com
 * @LastEditTime: 2022-08-08 07:01:47
 */
import codemirror from "codemirror-editor-vue3";
// base style
import "codemirror/lib/codemirror.css";
// theme css
import "codemirror/theme/eclipse.css";
import "codemirror/addon/hint/sql-hint";
// language
import "codemirror/mode/sql/sql.js";
// active-line.js
import "codemirror/addon/selection/active-line.js";
// styleSelectedText
import "codemirror/addon/selection/mark-selection.js";
import "codemirror/addon/search/searchcursor.js";
// highlightSelectionMatches
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";

// keyMap
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/sublime.js";
 
// foldGutter
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";

import { format } from "sql-formatter";
import draggable from 'vuedraggable'
import { ElMessage, ElMessageBox } from 'element-plus'
import Axios from 'axios';
export default {
    components: {
        codemirror,
        draggable
    },
    data() {
        return{
            users:[],
            headerUsers:[],
            loading:false,
            loadingText:"文件上传中，请耐心等待...",
            tplName:"",
            tabIndex:1,
            activeDatasetsName:"",
            addDatasetsDialogVisiable:false,//添加数据集页面是否显示
            datasets:[],//数据集
            sqlForm:{
                datasetName:"",
                datasourceId:"",
                id:"",
                sqlType:1,
            },
            dataSource:[],//模板数据源
            isParamMerge:true,
            reportTpls:[],//下钻报表
            paramForm:{
                paramName:"",//参数名称
                paramCode:"",//参数编码
                paramType:"",//参数类型
                dateFormat:'',//日期类型
                paramDefault:"",//默认值
                paramRequired:"",//是否必选
                selectContent:"",//下拉选择内容
                selectType:"",//内容来源
                isRelyOnParams:"",//是否依赖其他参数
                relyOnParams:"",//依赖参数代码
                paramHidden:"",//是否隐藏 1是 2否
                checkStrictly:"",//父子联动 1是 2否
            },
            procedureParamForm:{
                paramName:"",//参数名称
                paramCode:"",//参数编码
                paramType:"",//参数类型
                paramDefault:"",//默认值
                paramHidden:"",//是否隐藏
            },
            procedureOutParamForm:{
                paramName:"",//参数名称
                paramCode:"",//参数编码
                paramType:"",//参数类型
            },
            selectContentSuggestion:"",//下拉选择自定义内容提示
            cmOptions: {//codemirror参数配置
                smartIndent: true, //智能缩进
                indentUnit: 4, // 智能缩进单元长度为 4 个空格
                matchBrackets: true, //每当光标位于匹配的方括号旁边时，都会使其高亮显示
                autofocus: true,
                showCursorWhenSelecting: true,
                autoRefresh: true,
                tabSize: 4,
                foldGutter: true,
                styleActiveLine: true,
                lineNumbers: true,
                line: true,
                keyMap: "sublime",
                mode: "sql",
                theme: "eclipse",
                lineWrapping:true,
              },
            sqlText:"",
            //sql解析对应的列表格数据
            sqlColumnTableData:{
                tableData:[],
                tablePage:{
                    currentPage: 1,
                    pageSize:10,
                    pageTotal: 0,
                    pageSizeRange:[5, 10, 20, 50]
                },
              },
            //参数表单对应的参数
            paginationForm:{
                isPagination:"2",//是否分页
                pageCount:"100",//每页显示条数，默认为100
            },
            paramTableData:{
                tableData:[],
                tablePage:{
                    currentPage: 1,
                    pageSize:10,
                    pageTotal: 0,
                    pageSizeRange:[5, 10, 20, 50]
                },
            },
            procedureInParamTableData:{
                tableData:[],
                tablePage:{
                    currentPage: 1,
                    pageSize:10,
                    pageTotal: 0,
                    pageSizeRange:[5, 10, 20, 50]
                },
            },
            procedureOutParamTableData:{
                tableData:[],
                tablePage:{
                    currentPage: 1,
                    pageSize:10,
                    pageTotal: 0,
                    pageSizeRange:[5, 10, 20, 50]
                },
            },
            blockVisiable:false,//循环块对话框是否显示
            blockForm:{
                index:null,
                startCell:"",
                endCell:"",
                aggregateType:'',//聚合方式
                groupProperty:'',//分组属性
            },
            cellConditionVisiable:false,//单元格过滤条件对话框
            cellConditionForm:{
                index:null,
                property:"",//属性
                operator:"",//操作符
                type:"",//数据类型
                value:"",//条件
                dateFormat:"",//日期格式
            },
            cellHiddenConditionVisiable:false,//单元格过滤条件对话框
            cellHiddenConditionForm:{
              index:null,
              propertyName:"",
              property:"",//属性
              operator:"",//操作符
              type:"",//数据类型
              value:"",//条件
              dateFormat:"",//日期格式
            },
            sheetBlockData:[],
            blockData:{},//循环块数据
            datasourceType:"1", //1数据库 2api
            dragEndR:0,//拖拽停止单元格横坐标
            dragEndC:0,//拖拽停止单元格纵坐标
            cellDatas:[],
            extraCustomCellConfigs:{},//单元格额外的自定义配置
            cellFormats:{},//单元格格式
            title:"报表",//报表标题
            dictTypes:[],//字典类型
            cellForm:{//自定义单元格属性
                cellExtend:1,//扩展方向1不扩展 2纵向扩展 2横向扩展
                aggregateType:"list",//聚合类型 list：列表 group：分组 summary汇总
                digit:"2",//小数位数
                cellFunction:"",//函数
                dataFrom:1,//数据来源
                isGroupMerge:false,//分组后是否合并
                groupSummaryDependencyr:"",//分组依赖行号
                groupSummaryDependencyc:"",//分组依赖列号
                warning:false,//是否预警
                threshold:"80",//预警阈值
                warningColor:"#FF0000",
                warningContent:"",//预警内容
                isDict:false,//是否数据字典
                datasourceId:'',//数据字典数据源
                dictType:'',//字典类型
                groupProperty:'',//分组属性
                cellconditions:[],
                filterType:"and",
                seriesName:'',
                isDrill:false,//是否下钻
                drillId:'',//下钻报表id
                drillAttrs:'',//下钻参数属性，多个用,分割
                warningRules:">=",//预警规则
                unitTransfer:false,//是否数值单位转换
                transferType:1,//1 乘法 2除法
                multiple:"",//倍数
                hiddenType:"and",//隐藏类型 and or
                cellHiddenConditions:[],//隐藏条件
                isSubtotal:false,//追加小计
                subtotalAttrs:"",//小计属性
                subTotalCells:[],//小计单元格
                subTotalCalc:[],//小计分组链
                subTotalAttrs:[],//小计属性
            },
            delSheetsIndex:[],//删除的sheet index
            xAxisVisiable:false,
            xAxisForm:{
                chartId:"",//图表标识
                title:"",//图表标题
                dataType:null,//数据类型 1自定义 2数据集
                datasetId:null,//数据集id
                datasetName:null,//数据集名称
                attr:null,//数据集属性
                xAxisDatas:null,//自定义x轴数据，数组格式
                index:null,
            },
            sheetCharts:[],//sheet页中的表，临时存放用于添加x轴数据选择
            dataSetAttrs:[],//数据集属性
            sheetChartxAxisDatas:{},
            chartxAxisData:[],
            chartOffsetings:{},
            sheetOptions:{
                container: 'luckysheet', //luckysheet为容器id
                title:"", //表 头名
                lang: 'zh', //中文
                plugins: ['chart'],
                forceCalculation:true,
                index:'0', //工作表索引
                status:'1',//激活状态
                order:'0', //工作表的顺序
                hide:'0',  //是否隐藏
                showtoolbar: true,//是否显示工具栏
                showinfobar: false,//是否显示顶部信息栏
                showsheetbar: true,//是否显示底部sheet按钮
                showsheetbarConfig:{
                    add: true, //新增sheet  
                    menu: false, //sheet管理菜单
                    sheet: true //sheet页显示
                },
                sheetRightClickConfig:{
                    delete: true, // 删除
                    copy: true, // 复制
                    rename: false, //重命名
                    color: false, //更改颜色
                    hide: false, //隐藏，取消隐藏
                    move: false, //向左移，向右移
                },
                allowEdit: true,
                showtoolbarConfig:{
                    save:true,//保存
                    preview:true,
                    upload:true,
                    download:false,
                    downloadpdf:false,
                    datasource:false,
                    history:false,
                    saveAs:false,
                    picture:false,
                    redo:true,
                    undo:true,
                    shareMode:false,
                    currencyFormat: false, //货币格式
                    percentageFormat: false, //百分比格式
                    numberDecrease: false, // '减少小数位数'
                    numberIncrease: false, // '增加小数位数
                    moreFormats: true, // '更多格式'
                    border: true, // '边框'
                    textWrapMode: true, // '换行方式'
                    textRotateMode: false, // '文本旋转方式'
	                image:true, // '插入图片'
                    chart: true, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
                    postil:  true, //'批注'
                    pivotTable: false,  //'数据透视表'
                    function: true, // '公式'
                    frozenMode: true, // '冻结方式'
                    sortAndFilter: false, // '排序和筛选'
                    conditionalFormat: false, // '条件格式'
                    dataVerification: true, // '数据验证'
                    splitColumn: false, // '分列'
                    screenshot: false, // '截图'
                    protection:false, // '工作表保护'
	                  print:false, // '打印'
                },
                cellRightClickConfig:{
                    copyAs: false, // 复制为
                    deleteCell: true, // 删除单元格
                    hideRow: true, // 隐藏选中行和显示选中行
                    hideColumn: true, // 隐藏选中列和显示选中列
                    matrix: false, // 矩阵操作选区
                    sort: false, // 排序选区
                    filter: false, // 筛选选区
                    chart: false, // 图表生成
                    image: false, // 插入图片
                    data: false, // 数据验证
	                cellFormat: false // 设置单元格格式
                },
                hook:{
                    rangeSelect:this.rangeSelect,
                    cellDragStop:this.cellDragStop,
                    rowInsertAfter: this.rowInsertAfter,
                    rowDeleteAfter: this.rowDeleteAfter,
                    sheetActivate:this.sheetActivate,
                    sheetDeleteBefore:this.sheetDeleteBefore,
                    sheetCreateAfter:this.sheetCreateAfter,
                    sheetCopyBefore:this.sheetCopyBefore,
                    updateCellFormat:this.updateCellFormat,
                    cellMousedown:this.cellMousedown,
                    luckysheetDeleteCell:this.luckysheetDeleteCell,
                    chartMoveOrResize:this.chartMoveOrResize,
                    userChanged:this.userChanged,
                    cellUpdated:this.saveTplCache,
                    afterUpdateFormatCell:this.saveTplCache,
                    changeReportAttr:this.changeReportAttr,
                    changeBorder:this.saveTplCache,
                    afterMergeOperation:this.saveTplCache,
                    afterInsertImg:this.saveTplCache,
                    afterMoveImg:this.saveTplCache,
                    afterResizeImg:this.saveTplCache,
                    afterCropImg:this.saveTplCache,
                    afterRestoreImg:this.saveTplCache,
                    afterInsertLink:this.saveTplCache,
                    commentInsertAfter:this.saveTplCache,
                    commentUpdateAfter:this.saveTplCache,
                    commentDeleteAfter:this.saveTplCache,
                    commentShowHideAfter:this.saveTplCache,
                    commentShowHideAllAfter:this.saveTplCache,
                    afterFormulaOperation:this.saveTplCache,
                    frozenCancelAfter:this.frozenCancelAfter,
                    frozenCreateAfter:this.saveTplCache,
                    afterOperateVerifycation:this.saveTplCache,
                    afterHideRow:this.saveTplCache,
                    afterHideCol:this.saveTplCache,
                    afterShowRow:this.saveTplCache,
                    afterShowCol:this.saveTplCache,
                    afterChangeRowColSize:this.saveTplCache,
                    rangeClear:this.saveTplCache,
                    changeRowLen:this.saveTplCache,
                    changeColumnLen:this.saveTplCache,
                    rangePasteAfter:this.saveTplCache,
                    deleteSheet:this.deleteSheet,
                    sheetCopyAfter:this.saveNewSheetCache,
                    addAuthClick:this.addAuthClick,
                    viewAuthClick:this.viewAuthClick,
                    cellEditBefore:this.cellEditBefore,
                    copyPasteBefore:this.copyPasteBefore,
                    pasteHandlerBefore:this.pasteHandlerBefore,
                    rangeAuthCheck:this.rangeAuthCheck,
                    sheetActivateAfter: this.sheetActivateAfter,
                    formulaAuthCheck:this.formulaAuthCheck,
                    loadDataAfter:this.loadDataAfter,
                    saveClick:this.saveTpl,
                    previewClick:this.previewReport,
                    pdfsettingClick:this.pdfsettingClick,
                    uploadFileClick:this.uploadFileClick,
                }
            },
            settingModalConfig:{ 
              title: "PDF/打印设置", //弹窗标题,值为:新增，查看，编辑
              show: false, //弹框显示
              formEditDisabled:false,//编辑弹窗是否可编辑
              width:'800px',//弹出框宽度
              modalRef:"modalRef",//modal标识
              type:"1"//类型 1新增 2编辑 3保存
            },
            settingModalForm:[
              {type:'Select',label:'纸张类型',prop:'pageType',rules:{required:true},options:this.selectUtil.pageType},
              {type:'Select',label:'纸张布局',prop:'pageLayout',rules:{required:true},options:this.selectUtil.pageLayout},
              {type:'Select',label:'页眉是否显示',prop:'pageHeaderShow',rules:{required:true},options:this.selectUtil.yesNo,change:this.changePageHeaderShow},
              {type:'Input',label:'页眉显示内容',prop:'pageHeaderContent',rules:{required:true,maxLength:100}},
              {type:'Select',label:'页眉显示位置',prop:'pageHeaderPosition',rules:{required:true},options:this.selectUtil.pdfPosition},
              {type:'Select',label:'水印是否显示',prop:'waterMarkShow',rules:{required:true},options:this.selectUtil.yesNo,change:this.changeWaterMarkShow},
              {type:'Select',label:'水印类型',prop:'waterMarkType',rules:{required:true},options:this.selectUtil.waterMarkType,change:this.changeWaterMarkType},
              {type:'Input',label:'水印内容',prop:'waterMarkContent',rules:{required:true,maxLength:100},},
              {type:'Upload',label:'水印图片',prop:'waterMarkImgs',rules:{required:false},width:"400px",multiple:false,limit:1},
              {type:'Input',label:'水印图片链接',prop:'waterMarkImg',rules:{required:true},width:"500px"},
              {type:'Input',label:'水印透明度',prop:'waterMarkOpacity',rules:{required:true,type:"number",min:0.01,max:0.99,float:2},},
              {type:'Select',label:'页码是否显示',prop:'pageShow',rules:{required:true},options:this.selectUtil.yesNo,change:this.changePageShow},
              {type:'Select',label:'页码显示位置',prop:'pagePosition',rules:{required:true},options:this.selectUtil.pdfPosition},
              {type:'Select',label:'是否水平分页',prop:'horizontalPage',rules:{required:true},options:this.selectUtil.yesNo,change:this.changeHorizontalPage},
              {type:'Input',label:'分页列',prop:'horizontalPageColumn',rules:{required:true}},
            ],
            settingFormData:{
              pageType:null,//纸张类型
              pageLayout:null,
              pageHeaderShow:null,
              pageHeaderContent:null,
              pageHeaderPosition:null,
              waterMarkShow:null,
              waterMarkType:null,
              waterMarkContent:"",
              waterMarkImgs:[],
              waterMarkImg:"",
              waterMarkOpacity:null,
              pageShow:null,
              pagePosition:null,
              horizontalPage:null,
              horizontalPageColumn:null,
            },
            defaultSettingFormData:{
              pageType:2,//纸张类型
              pageLayout:1,
              pageHeaderShow:1,
              pageHeaderContent:"",
              pageHeaderPosition:1,
              waterMarkShow:1,
              waterMarkType:1,
              waterMarkContent:"",
              waterMarkImgs:[],
              waterMarkImg:"",
              waterMarkOpacity:"0.4",
              pageShow:1,
              pagePosition:2,
              horizontalPage:2,
              horizontalPageColumn:"",
            },
            //modal 数据 end
              //modal 按钮 start
            settingModalHandles:[
              {label:'取消',type:'default',handle:()=>this.closeSettingModal()},
              {label:'确定',type:'primary',handle:()=>this.confirmPrintSettings()}
            ],
            sheetPrintSettings:{},
            designHeight:0,
            cellSubTotalVisiable:false,
            cellSubTotalForm:{
              coords:"",//坐标
              type:"",//类型 1合计 2平均值 3最大值 4最小值 5计数
            },
            subTotalCalcVisiable:false,
            subTotalCalcForm:{
              attrs:[],//属性
            },
            subTotalAttrsVisiable:false,
            subTotalAttrsForm:{
              name:"",//小计名称
              fontColor:"",//小计颜色
              fontSize:"",//字体大小
              bgColor:"",//背景颜色
              fontWeight:null,//是否加粗
            },
            addAuthVisiable:false,
            addAuthForm:{
              userIds:[]
            },
            authUsers:[],
            authTitle:"",
            sheetRangeAuth:{},
            rangeAxis:null,
            range:null,
            isCreator:false,
            creatorName:"",
            sheetAuthedCells:{},//sheet页已经授权的单元格
            authdialogVisible:false,
            authedRange:[],
            attrDisabled:false,//单元格属性是否禁用，没权限的情况下需要禁用，禁止操作
            authedRangeTitle:"",
            uploadType:"xlsx",
        }
    },
    mounted() {
        var that = this;
        this.$nextTick(() => {
          that.isInputPassWord();
          that.getUsers();
          that.designHeight = document.body.clientHeight - 46;
          window.onresize = function(){
            that.designHeight = document.body.clientHeight - 46;
          }
        })
    },
    methods: {
        init(charts){
            let _this = this;
            const reportTplId = this.$route.query.tplId// reportTplId
            var options = this.sheetOptions;
            options.isReport=true;
            options.allowUpdate=true;
            options.gridKey="designMode-"+reportTplId;
            options.updateUrl = location.protocol === 'https:' ? 'wss'+"://"+ location.host +"/api/coedit/websocket/luckysheet" : 'ws'+"://"+ location.host +"/api/coedit/websocket/luckysheet";
            options.uploadImage = this.commonUtil.uploadImage;
            if(!this.isCreator)
            {
              options.cellRightClickConfig.insertRow = false;
              options.cellRightClickConfig.insertColumn = false;
              options.cellRightClickConfig.deleteRow = false;
              options.cellRightClickConfig.deleteColumn = false;
              options.cellRightClickConfig.deleteCell = false;
            }
            luckysheet.create(options);
            luckysheet.setServerAttr("version","vue3");
            if(charts && charts.length > 0){
              for (let index = 0; index < charts.length; index++) {
                const element = charts[index];
                var offsetings = {
                  offsetHeight:element.offsetHeight,
                  offsetWidth:element.offsetWidth
                }
                this.chartOffsetings[element.chart_id] = offsetings;
              }
              setTimeout(function(){
                for (let index = 0; index < charts.length; index++) {
                  const element = charts[index];
                  var chartc = element.chart_id + "_c";
                  var chartDiv =  document.getElementById(chartc);
                  if(chartDiv)
                  {
                    chartDiv.addEventListener("mouseup",_this.changeChartListener);
                  }
                }
              },"1000");
            }
        },
        //范围选中事件
        rangeSelect(sheet,range){
            this.attrDisabled = !this.checkRangeAuth(range)
            var cellFormData = this.getExtraCustomCellConfigs(range[0].row[0],range[0].column[0]);
            if(cellFormData)
            {
                if(cellFormData.cellExtend)
                {
                    this.cellForm.cellExtend = cellFormData.cellExtend;
                }else{
                    this.cellForm.cellExtend = 1;
                }
                if(cellFormData.aggregateType)
                {
                    this.cellForm.aggregateType = cellFormData.aggregateType;
                }else{
                    this.cellForm.aggregateType = "list";
                }
                if(cellFormData.cellFunction)
                {
                    this.cellForm.cellFunction = cellFormData.cellFunction+"";
                }else{
                    this.cellForm.cellFunction = "1";
                }
                this.cellForm.digit = cellFormData.digit;
                this.cellForm.groupSummaryDependencyr = cellFormData.groupSummaryDependencyr;
                this.cellForm.groupSummaryDependencyc = cellFormData.groupSummaryDependencyc;
                this.cellForm.isGroupMerge = cellFormData.isGroupMerge;
                this.cellForm.dataFrom = cellFormData.dataFrom;
                if(!cellFormData.warning)
                {
                    this.cellForm.warning = false;
                    this.cellForm.warningRules = '>='
                    this.cellForm.threshold = "80";
                    this.cellForm.warningColor = "#FF0000";
                    this.cellForm.warningContent = "";
                }else{
                    this.cellForm.warning = cellFormData.warning;
                    this.cellForm.warningRules = cellFormData.warningRules
                    this.cellForm.threshold = cellFormData.threshold;
                    this.cellForm.warningColor = cellFormData.warningColor;
                    this.cellForm.warningContent = cellFormData.warningContent;
                }
                this.cellForm.isDict = cellFormData.isDict
                this.cellForm.datasourceId = cellFormData.datasourceId
                this.cellForm.dictType = cellFormData.dictType
                this.cellForm.groupProperty = cellFormData.groupProperty
                this.cellForm.cellconditions = cellFormData.cellconditions;
                this.cellForm.filterType = cellFormData.filterType;
                this.cellForm.seriesName = cellFormData.seriesName;
                this.cellForm.isDrill = cellFormData.isDrill;
                this.cellForm.drillId = cellFormData.drillId;
                this.cellForm.drillAttrs = cellFormData.drillAttrs;
                this.cellForm.unitTransfer = cellFormData.unitTransfer;
                this.cellForm.transferType = cellFormData.transferType;
                this.cellForm.multiple = cellFormData.multiple;
                this.cellForm.cellHiddenConditions = cellFormData.cellHiddenConditions;
                this.cellForm.hiddenType = cellFormData.hiddenType;
                this.cellForm.isSubtotal = cellFormData.isSubtotal;
                this.cellForm.subTotalCells = cellFormData.subTotalCells;
                this.cellForm.subTotalCalc = cellFormData.subTotalCalc;
                this.cellForm.subTotalAttrs = cellFormData.subTotalAttrs;
                if(cellFormData.isDrill && cellFormData.drillId)
                {
                    this.reportTpls = [];
                    var drillReport = {
                        id:cellFormData.drillId,
                        tplName:cellFormData.drillTplName
                    }
                    this.reportTpls.push(drillReport);
                }else{
                    // this.getDrillReport();
                }
            }else{
                this.cellForm.cellExtend = 1;
                this.cellForm.aggregateType = "list";
                this.cellForm.groupSummaryDependencyr = "";
                this.cellForm.groupSummaryDependencyc = "";
                this.cellForm.cellFunction = "";
                this.cellForm.digit = 2;
                this.cellForm.isGroupMerge = false;
                this.cellForm.dataFrom = 1;
                this.cellForm.dataFrom = 1;
                this.cellForm.warning = false;
                this.cellForm.warningRules = '>='
                this.cellForm.threshold = "80";
                this.cellForm.warningColor = "#FF0000";
                this.cellForm.warningContent = "";
                this.cellForm.isDict = false;
                this.cellForm.datasourceId = ''
                this.cellForm.dictType = ''
                this.cellForm.groupProperty = '';
                this.cellForm.cellconditions = [];
                this.cellForm.filterType = 'and';
                this.cellForm.seriesName = '';
                this.cellForm.isDrill = false;
                this.cellForm.drillId = '';
                this.cellForm.drillAttrs = '';
                this.cellForm.unitTransfer = false;
                this.cellForm.transferType = '1';
                this.cellForm.multiple = '100';
                this.cellForm.cellHiddenConditions = [];
                this.cellForm.hiddenType = 'and';
                this.cellForm.isSubtotal = false;
                this.cellForm.subTotalCells = [];
                this.cellForm.subTotalCalc = [];
                this.cellForm.subTotalAttrs = [];
                // this.getDrillReport();
            }
            if(this.cellForm.datasourceId)
            {
                this.getDatasourceAttr();
            }
        },
        //插入行或者列监听事件
        rowInsertAfter(coordinate, count,direction,type,sheetIndex) {
          if(type == "row")
          {
            this.insertRows(coordinate, count,direction,sheetIndex)
          }else{
            this.insertCols(coordinate, count,direction,sheetIndex);
          }
        },
        //删除行或者列监听事件
        rowDeleteAfter(deleteRange, type,sheetIndex) {
          for (let index = deleteRange.length-1; index >= 0; index--) {
            const element = deleteRange[index];
            if(type == "row"){
              this.deleteRows(element[0], element[1],sheetIndex)
            }else{
              this.deleteCols(element[0], element[1],sheetIndex)
            }
          }
        },
        cellDragStop(cell,position)
        {
            this.dragEndR = position.r;
            this.dragEndC = position.c;
        },
        //拖拽结束事件
        endDraggable(datasetName,columnName){
            var luckysheetfile = luckysheet.getSheet();
            let checkResult = this.checkUserEditAuth(this.dragEndR, this.dragEndC);
            if(!checkResult)
            {
              this.commonUtil.showMessage({ message: '暂无编辑权限，如需编辑可联系创建者【'+this.creatorName+"】。", type: this.commonConstants.messageType.error })
              return;
            }
            luckysheet.setCellValue(this.dragEndR,this.dragEndC,datasetName+".${"+columnName+"}",{order:luckysheetfile.order});
        },
        //获取当前选中的单元格
        getSelectRangeCells(){
            var cells = [];
            var selectedRanges = luckysheet.getRange();
            if(selectedRanges && selectedRanges.length>0)
            {
                for (let index = 0; index < selectedRanges.length; index++) {
                    const range = selectedRanges[index];
                    for (let r = range.row[0]; r <= range.row[1]; r++) {
                        for (let c = range.column[0]; c <= range.column[1]; c++) {
                            var cell = [r,c];
                            cells.push(cell)
                        }
                    }
                }
            }
            return cells;
        },
        //获取表格数据,
        //isAll 是否返回全部单元格，true，则返回所有设置单元格格式和内容的单元格，false则只返回有内容的单元格，只有格式没有数据的单元格也不返回
        getCellDatas(luckysheetfile){
            var result = []
            // var luckysheetfile = luckysheet.getLuckysheetfile();
            var data = luckysheet.transToCellData(luckysheetfile.data)
            if (data && data.length > 0) {
                for (let index = 0; index < data.length; index++) {
                const element = data[index]
                if (element.v && element.v.mc && !element.v.v) {
                    if (element.v.ct && element.v.ct.t == 'inlineStr') {
                    result.push(element)
                    }
                } else {
                    result.push(element)
                }
                }
            }
            return result
        },
        getXxbtScreenShot(luckysheetfile){
          var screenShots = {};
          var data = luckysheet.transToCellData(luckysheetfile.data)
          if (data && data.length > 0) {
            for (let index = 0; index < data.length; index++) {
              const element = data[index]
              {
                if (element.v && element.v.xxbt == 1 && element.v.v && element.v.v.split("|").length > 1 &&element.v.v.split("|").length<5) {
                  let r = element.r;
                  let c = element.c;
                  // let rs = 1;
                  // let cs = 1;
                  // if(element.v && element.v.mc && element.v.mc.rs && element.v.mc.cs)
                  // {
                  //   rs = element.v.mc.rs;
                  //   cs = element.v.mc.cs;
                  // }
                  // let start = this.commonUtil.getColumnFromCoords(r,c);
                  // let end = this.commonUtil.getColumnFromCoords(r+rs-1,c+cs-1);
                  // let range = start+":"+end;
                  // let src = luckysheet.getScreenshot({range:range},false);
                  screenShots[r+"_"+c] = element.v.v;
                }
              }
            }
          }
          return screenShots;
        },
        //修改单元格扩展方式
        changeCellExtend(){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if(obj)
                    {
                        obj.cellExtend = this.cellForm.cellExtend;
                        if(obj.cellExtend == 4)
                        {
                            obj.dataFrom = 3;
                            this.cellForm.dataFrom = 3;
                        }else{
                            obj.dataFrom = this.cellForm.dataFrom;
                        }
                    }else{
                        obj = {};
                        obj.cellExtend = this.cellForm.cellExtend
                        if(this.cellForm.cellExtend == 4)
                        {
                            this.cellForm.dataFrom = 3;
                            obj.dataFrom = 3;
                        }
                        this.setExtraCustomCellConfigs(element[0],element[1],obj);
                    }
                }
                var obj = {
                  cells:cells,
                  value:this.cellForm.cellExtend
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": "cellExtend"});
                this.saveTplCache();
            }
        },
        //修改单元格聚合方式
        changeAggregateType(){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if(obj)
                    {
                        obj.aggregateType = this.cellForm.aggregateType
                    }else{
                        obj = {};
                        obj.aggregateType = this.cellForm.aggregateType
                        this.setExtraCustomCellConfigs(element[0],element[1],obj);
                    }
                }
                var obj = {
                  cells:cells,
                  value:this.cellForm.aggregateType
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": "aggregateType"});
                this.saveTplCache();
            }
        },
        //修改分组依赖
        changeGroupSummary(type){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if(obj && obj.dataFrom==3)
                    {
                        if(type == 'r')
                        {
                            obj.groupSummaryDependencyr = this.cellForm.groupSummaryDependencyr
                        }else{
                            obj.groupSummaryDependencyc = this.cellForm.groupSummaryDependencyc
                        }
                        
                    }
                }
                var obj = {
                  cells:cells,
                  value:type == 'r'?obj.groupSummaryDependencyr:obj.groupSummaryDependencyc
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": type == 'r'?'groupSummaryDependencyr':'groupSummaryDependencyc'});
                this.saveTplCache();
            }
        },
        //修改汇总方式
        changeSummaryType(){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if(obj && (obj.aggregateType == "summary" || obj.aggregateType == "groupSummary"))
                    {
                        obj.cellFunction = this.cellForm.cellFunction
                    }
                }
                var obj = {
                  cells:cells,
                  value:this.cellForm['cellFunction']
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'cellFunction'});
                this.saveTplCache();
            }
        },
        //修改小数位数
        changeDigit(){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if (obj && (obj.aggregateType == 'summary' || obj.aggregateType == 'groupSummary' || obj.unitTransfer))
                    {
                        obj.digit = this.cellForm.digit
                    }
                }
                var obj = {
                  cells:cells,
                  value:this.cellForm['digit']
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'digit'});
                this.saveTplCache();
            }
        },
        //修改分组单元格是否合一
        changeIsGroupMerge(){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if(obj && (obj.aggregateType == "group" || obj.aggregateType == "groupSummary"))
                    {
                        obj.isGroupMerge = this.cellForm.isGroupMerge
                    }
                }
                var obj = {
                  cells:cells,
                  value:this.cellForm['isGroupMerge']
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'isGroupMerge'});
                this.saveTplCache();
            }
        },
        //修改数据来源
        changeDataFrom(){
            var cells = this.getSelectRangeCells();
            if(cells && cells.length>0)
            {
                for (let index = 0; index < cells.length; index++) {
                    const element = cells[index];
                    var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                    if(obj)
                    {
                        obj.dataFrom = this.cellForm.dataFrom
                    }else {
                        obj = {}
                        obj.dataFrom = this.cellForm.dataFrom
                        this.setExtraCustomCellConfigs(element[0], element[1], obj)
                    }
                }
                var obj = {
                  cells:cells,
                  value:this.cellForm['dataFrom']
                }
                const sheetIndex = luckysheet.getSheet().index;
                luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'dataFrom'});
                this.saveTplCache();
            }
        },
        
        //插入行
        //coordinate：插入行横坐标 count 插入数量
        insertRows(coordinate, count,direction,sheetIndex) {
          
          var isSaveCache = true;
          var sheetExtraCustomCellConfigs = {}
          if(sheetIndex == null)
          {
            sheetIndex = luckysheet.getSheet().index;
          }else{
            isSaveCache = false;
          }
          const map = this.extraCustomCellConfigs[sheetIndex]
          if (Object.keys(map).length > 0) {
            for(var key in map){
              const value = map[key];
              var r = parseInt(key.split('_')[0])
              var c = parseInt(key.split('_')[1])
              var dataFrom = value.dataFrom;
              if(dataFrom == 3)
              {
                let groupSummaryDependencyr = Number(value.groupSummaryDependencyr)-1;
                if(groupSummaryDependencyr != null)
                {
                  if(groupSummaryDependencyr >= coordinate)
                  {
                    value.groupSummaryDependencyr = Number(groupSummaryDependencyr) + count + 1;
                  }
                }
              }
              if(direction == "lefttop")
              {
                if (r >= coordinate) {
                  var newR = r + count
                  sheetExtraCustomCellConfigs[newR + '_' + c] = value
                } else {
                  sheetExtraCustomCellConfigs[key] = value
                }
              }else{
                if (r > coordinate) {
                  var newR = r + count
                  sheetExtraCustomCellConfigs[newR + '_' + c] = value
                } else {
                  sheetExtraCustomCellConfigs[key] = value
                }
              }
              
            }
            this.extraCustomCellConfigs[sheetIndex] = sheetExtraCustomCellConfigs
            if(isSaveCache)
            {
              this.saveTplCache();
            }
          }
        },
        //插入列
        //coordinate插入列纵坐标 count 插入数量
        insertCols(coordinate, count,direction,sheetIndex) {
          var isSaveCache = true;
          var sheetExtraCustomCellConfigs = {}
          if(sheetIndex == null)
          {
            sheetIndex = luckysheet.getSheet().index;
          }else{
            isSaveCache = false;
          }
          const map = this.extraCustomCellConfigs[sheetIndex]
          if (Object.keys(map).length > 0) {
            for(var key in map){
              const value = map[key];
              var r = parseInt(key.split('_')[0])
              var c = parseInt(key.split('_')[1])
              var dataFrom = value.dataFrom;
              if(dataFrom == 3)
              {
                let groupSummaryDependencyc = value.groupSummaryDependencyc;
                if(groupSummaryDependencyc)
                {
                  var c1 = this.commonUtil.getcFromColumnName(groupSummaryDependencyc);
                  if(c1 >= coordinate)
                  {
                    value.groupSummaryDependencyc = this.commonUtil.getColumnNameFromC(Number(c1) + count);
                  }
                }
              }
              if(direction == "lefttop"){
                if (c >= coordinate) {
                  var newC = c + count
                  sheetExtraCustomCellConfigs[r + '_' + newC] = value
                } else {
                  sheetExtraCustomCellConfigs[key] = value
                }
              }else{
                if (c > coordinate) {
                  var newC = c + count
                  sheetExtraCustomCellConfigs[r + '_' + newC] = value
                } else {
                  sheetExtraCustomCellConfigs[key] = value
                }
              }
            }
            this.extraCustomCellConfigs[sheetIndex] = sheetExtraCustomCellConfigs
            if(isSaveCache)
            {
              this.saveTplCache();
            }
          }
        },
        //删除行
        //start开始坐标 end：结束坐标
        deleteRows(start, end,sheetIndex) {
          var isSaveCache = true;
          var sheetExtraCustomCellConfigs = {}
            if(sheetIndex == null)
            {
              sheetIndex = luckysheet.getSheet().index;
            }else{
              isSaveCache = false;
            }
            const map = this.extraCustomCellConfigs[sheetIndex]
            if (Object.keys(map).length > 0) {
              for(var key in map){
                const value = map[key];
                var r = parseInt(key.split('_')[0])
                var c = parseInt(key.split('_')[1])
                var dataFrom = value.dataFrom;
                if(dataFrom == 3)
                {
                  let groupSummaryDependencyr = Number(value.groupSummaryDependencyr) - 1;
                  if(groupSummaryDependencyr != null)
                  {
                    if(groupSummaryDependencyr >= start && groupSummaryDependencyr<=end)
                    {
                      value.groupSummaryDependencyr = "";
                      value.groupSummaryDependencyc = "";
                      value.dataFrom = 1;
                    }else if(groupSummaryDependencyr > end)
                    {
                      value.groupSummaryDependencyr = Number(groupSummaryDependencyr) - (end - start + 1) + 1;
                    }
                  }
                }
                if (r < start) {
                  sheetExtraCustomCellConfigs[key] = value
                } else if (r > end) {
                  var newR = r - (end - start + 1)
                  sheetExtraCustomCellConfigs[newR + '_' + c] = value
                }
              }
              this.extraCustomCellConfigs[sheetIndex] = sheetExtraCustomCellConfigs
              if(isSaveCache)
              {
                this.saveTplCache();
              }
            }
        },
        //删除列
        //start开始坐标 end：结束坐标
        deleteCols(start, end,sheetIndex) {
          var isSaveCache = true;
          var sheetExtraCustomCellConfigs = {}
          if(sheetIndex == null)
          {
            sheetIndex = luckysheet.getSheet().index;
          }else{
            isSaveCache = false;
          }
          const map = this.extraCustomCellConfigs[sheetIndex]
          if (Object.keys(map).length > 0) {
            for(var key in map){
              const value = map[key];
              var r = parseInt(key.split('_')[0])
              var c = parseInt(key.split('_')[1])
              var dataFrom = value.dataFrom;
              if(dataFrom == 3)
              {
                let groupSummaryDependencyc = value.groupSummaryDependencyc;
                if(groupSummaryDependencyc)
                {
                  var c1 = this.commonUtil.getcFromColumnName(groupSummaryDependencyc);
                  if(c1 >= start && c1<=end)
                  {
                    value.dataFrom = 1;
                    value.groupSummaryDependencyr = "";
                    value.groupSummaryDependencyc = "";
                  }else if(c1 > end)
                  {
                    value.groupSummaryDependencyc = this.commonUtil.getColumnNameFromC(Number(c1) - (end - start + 1));
                  }
                }
              }
              if (c < start) {
                sheetExtraCustomCellConfigs[key] = value
              } else if (c > end) {
                var newC = c - (end - start + 1)
                sheetExtraCustomCellConfigs[r + '_' + newC] = value
              }
            }
            this.extraCustomCellConfigs[sheetIndex] = sheetExtraCustomCellConfigs
            if(isSaveCache)
            {
              this.saveTplCache();
            }
          }
        },
        //获取数据集
        getDataSets(){
            let reportTplId=this.$route.query.tplId;;//reportTplId
            let obj = {
                url:this.apis.reportDesign.getDataSetsApi,
                params:{tplId:reportTplId},
                removeEmpty:false,
            }
            this.commonUtil.doPost(obj) .then(response=>{
                if (response.code == "200")
                {
                    this.datasets = response.responseData;
                    if(this.datasets && this.datasets.length>0)
                    {
                        this.activeDatasetsName = this.datasets[0].datasetName;
                    }
                    
                }
            });
        },
        //添加数据集
        addDataSets(){
            // this.getReportTplDateSource();
            this.addDatasetsDialogVisiable = true;
            this.$nextTick(() => {
                this.sqlText = " ";
            });
        },
        //获取模板关联的数据源
        getReportTplDateSource(){
            let reportTplId=this.$route.query.tplId;;//reportTplId
            let obj = {
                url:this.apis.reportDesign.getReportTplDateSourceApi,
                params:{tplId:reportTplId},
                removeEmpty:false,
            }
            this.commonUtil.doPost(obj) .then(response=>{
                if (response.code == "200")
                {
                    this.dataSource = response.responseData
                    this.changeDatasource();
                }
            });
        },
        //关闭添加数据源
        closeAddDataSet(){
            this.addDatasetsDialogVisiable = false;
            if(this.datasourceType == "1")
            {
                this.sqlText = " ";
            }
            this.commonUtil.clearObj(this.sqlForm);
            this.commonUtil.clearObj(this.paramForm);
            this.commonUtil.clearObj(this.paginationForm);
            this.sqlColumnTableData.tableData = [];
            this.sqlColumnTableData.tablePage.currentPage=1;
            this.sqlColumnTableData.tablePage.pageTotal=0;
            this.paramTableData.tableData = [];
            this.paramTableData.tablePage.currentPage=1;
            this.paramTableData.tablePage.pageTotal=0;
            this.paginationForm.isPagination = "2";
            this.paginationForm.pageCount = "100";
            this.datasourceType = "1";
        },
        //选择数据源修改
        changeDatasource(){
            for (let index = 0; index < this.dataSource.length; index++) {
                const element = this.dataSource[index];
                if(this.sqlForm.datasourceId == element.datasourceId)
                {
                    if(element.type == "4")
                    {
                        this.sqlColumnTableData.tableData = [];
                        this.datasourceType = "2";
                        if(element.apiColumns)
                        {
                            let columns = JSON.parse(element.apiColumns);
                            if(columns.length > 0)
                            {
                                for (let index = 0; index < columns.length; index++) {
                                    const element = columns[index];
                                    var obj = {
                                        columnName:element.propName,
                                        name:element.propCode
                                    }
                                    this.sqlColumnTableData.tableData.push(obj);
                                }
                            }
                        }
                    }else{
                        this.datasourceType = "1";
                    }
                    break;
                }
            }
        },
        //执行sql语句并解析
        execSql(){
            this.$refs['sqlRef'].validate((valid) => {
                if (valid) {
                let reportTplId=this.$route.query.tplId;;//reportTplId
                let obj = {
                    url:this.apis.reportDesign.execSqlApi,
                    params:{tplId:reportTplId,tplSql:this.sqlText,datasourceId:this.sqlForm.datasourceId,sqlType:this.sqlForm.sqlType,
                        inParam:this.procedureInParamTableData.tableData?JSON.stringify(this.procedureInParamTableData.tableData):"",outParam:this.procedureOutParamTableData.tableData?JSON.stringify(this.procedureOutParamTableData.tableData):""},
                    removeEmpty:false,
                }
                this.commonUtil.doPost(obj) .then(response=>{
                    if (response.code == "200")
                    {
                        this.sqlColumnTableData.tableData = response.responseData;
                        this.sqlColumnTableData.tablePage.pageTotal = response.responseData.length;
                    }
                });
                }
            });
        },
        formatSql(){//sql格式化
            let sqlContent="";
            sqlContent=this.sqlText;
            this.sqlText = format(sqlContent)
        },
        //sql语句列表修改当前页触发事件
        handleCurrentChange:function(val){
            this.sqlColumnTableData.tablePage.currentPage = val;
        },
        //sql语句列表修改当每页显示条数触发事件
        handleSizeChange:function(val){
            this.sqlColumnTableData.tablePage.pageSize = val;
        },
        //添加参数
        addParam(){
            this.$refs['paramRef'].validate((valid) => {
                if (valid) {
                    //从列表冲根据paramCode获取是否已经添加该参数
                    let result = this.commonUtil.getItemIndexFromList(this.paramTableData.tableData,'paramCode',this.paramForm.paramCode);
                    if(result.index >=0)
                    {//已经添加该参数，则修改参数内容
                        this.paramTableData.tableData[result.index].paramName = this.paramForm.paramName;
                        this.paramTableData.tableData[result.index].paramType = this.paramForm.paramType;
                        this.paramTableData.tableData[result.index].dateFormat = this.paramForm.dateFormat
                        this.paramTableData.tableData[result.index].paramDefault = this.paramForm.paramDefault;
                        this.paramTableData.tableData[result.index].paramRequired = this.paramForm.paramRequired;
                        this.paramTableData.tableData[result.index].selectType = this.paramForm.selectType;
                        this.paramTableData.tableData[result.index].selectContent = this.paramForm.selectContent;
                        this.paramTableData.tableData[result.index].isRelyOnParams = this.paramForm.isRelyOnParams;
                        this.paramTableData.tableData[result.index].relyOnParams = this.paramForm.relyOnParams;
                        this.paramTableData.tableData[result.index].paramHidden = this.paramForm.paramHidden
                        this.paramTableData.tableData[result.index].checkStrictly = this.paramForm.checkStrictly
                    }else{
                    //未添加该参数，则列表中新增一条数据
                    let row = {
                        paramName:this.paramForm.paramName,
                        paramCode:this.paramForm.paramCode,
                        paramType:this.paramForm.paramType,
                        dateFormat: this.paramForm.dateFormat,
                        paramDefault:this.paramForm.paramDefault,
                        paramRequired:this.paramForm.paramRequired,
                        selectType:this.paramForm.selectType,
                        selectContent:this.paramForm.selectContent,
                        isRelyOnParams: this.paramForm.isRelyOnParams == ""?"2":this.paramForm.isRelyOnParam,
                        relyOnParams:this.paramForm.relyOnParams,
                        paramHidden: this.paramForm.paramHidden,
                        checkStrictly: this.paramForm.checkStrictly == ""?"":this.paramForm.checkStrictly,
                    };
                    this.paramTableData.tableData.push(row);
                    }
                    this.$refs['paramRef'].resetFields();//校验重置
                    this.commonUtil.clearObj(this.paramForm);
                }else{
                    return false;
                }
            });
        },
        //编辑参数
        editParam(row){
            this.paramForm.paramName = row.paramName;
            this.paramForm.paramCode = row.paramCode;
            this.paramForm.paramType = row.paramType;
            this.paramForm.dateFormat = row.dateFormat
            this.paramForm.paramDefault = row.paramDefault;
            this.paramForm.paramRequired = row.paramRequired;
            this.paramForm.selectType = row.selectType;
            this.paramForm.selectContent = row.selectContent;
            this.paramForm.isRelyOnParams = row.isRelyOnParams;
            this.paramForm.relyOnParams = row.relyOnParams;
            this.paramForm.paramHidden = row.paramHidden
            this.paramForm.checkStrictly = row.checkStrictly
        },
        //删除参数
        deleteParam(index){
            this.paramTableData.tableData.splice(index,1)
        },
        //添加输入参数
        addInParam(){
            this.$refs['inParamRef'].validate((valid) => {
                if (valid) {
                    //从列表冲根据paramCode获取是否已经添加该参数
                    let result = this.commonUtil.getItemIndexFromList(this.procedureInParamTableData.tableData,'paramCode',this.procedureParamForm.paramCode);
                    if(result.index >=0)
                    {//已经添加该参数，则修改参数内容
                        this.procedureInParamTableData.tableData[result.index].paramName = this.procedureParamForm.paramName;
                        this.procedureInParamTableData.tableData[result.index].paramType = this.procedureParamForm.paramType;
                        this.procedureInParamTableData.tableData[result.index].paramDefault = this.procedureParamForm.paramDefault;
                        this.procedureInParamTableData.tableData[result.index].paramRequired = this.procedureParamForm.paramRequired;
                        this.procedureInParamTableData.tableData[result.index].paramHidden = this.procedureParamForm.paramHidden
                    }else{
                    //未添加该参数，则列表中新增一条数据
                    let row = {
                        paramName:this.procedureParamForm.paramName,
                        paramCode:this.procedureParamForm.paramCode,
                        paramType:this.procedureParamForm.paramType,
                        paramDefault:this.procedureParamForm.paramDefault,
                        paramHidden: this.procedureParamForm.paramHidden
                    };
                    this.procedureInParamTableData.tableData.push(row);
                    }
                    this.$refs['inParamRef'].resetFields();//校验重置
                    this.commonUtil.clearObj(this.procedureParamForm);
                }else{
                    return false;
                }
            });
        },
        //编辑输入参数
        editInParam(row){
            this.procedureParamForm.paramName = row.paramName;
            this.procedureParamForm.paramCode = row.paramCode;
            this.procedureParamForm.paramType = row.paramType;
            this.procedureParamForm.paramDefault = row.paramDefault;
            this.procedureParamForm.paramHidden = row.paramHidden
        },
        //删除输入参数
        deleteInParam(index){
            this.procedureInParamTableData.tableData.splice(index,1)
        },
        moveUp(index,type){
            if(type == '1'){
                //输入参数
                this.commonUtil.moveUp(this.procedureInParamTableData.tableData,index)
            }else{
                //输出参数
                this.commonUtil.moveUp(this.procedureOutParamTableData.tableData,index)
            }
        },
        moveDown(index,type){
            if(type == '1'){
                //输入参数
                this.commonUtil.moveDown(this.procedureInParamTableData.tableData,index)
            }else{
                //输出参数
                this.commonUtil.moveDown(this.procedureOutParamTableData.tableData,index)
            }
        },
        //添加输入参数
        addOutParam(){
            this.$refs['outParamRef'].validate((valid) => {
                if (valid) {
                    //从列表冲根据paramCode获取是否已经添加该参数
                    let result = this.commonUtil.getItemIndexFromList(this.procedureOutParamTableData.tableData,'paramCode',this.procedureOutParamForm.paramCode);
                    if(result.index >=0)
                    {//已经添加该参数，则修改参数内容
                        this.procedureOutParamTableData.tableData[result.index].paramName = this.procedureOutParamForm.paramName;
                        this.procedureOutParamTableData.tableData[result.index].paramType = this.procedureOutParamForm.paramType;
                        this.procedureOutParamTableData.tableData[result.index].paramDefault = this.procedureOutParamForm.paramDefault;
                    }else{
                    //未添加该参数，则列表中新增一条数据
                    let row = {
                        paramName:this.procedureOutParamForm.paramName,
                        paramCode:this.procedureOutParamForm.paramCode,
                        paramType:this.procedureOutParamForm.paramType,
                    };
                    this.procedureOutParamTableData.tableData.push(row);
                    }
                    this.$refs['outParamRef'].resetFields();//校验重置
                    this.commonUtil.clearObj(this.procedureOutParamForm);
                }else{
                    return false;
                }
            });
        },
        //编辑输出参数
        editOutParam(row){
            this.procedureOutParamForm.paramName = row.paramName;
            this.procedureOutParamForm.paramCode = row.paramCode;
            this.procedureOutParamForm.paramType = row.paramType;
        },
        //删除输出参数
        deleteOutParam(index){
            this.procedureOutParamTableData.tableData.splice(index,1)
        },
        //编辑数据及
        editDataSet(dataSet){
            this.addDatasetsDialogVisiable = true;
            this.$nextTick(() => {
                this.sqlText = dataSet.tplSql;
            });
            if(dataSet.tplParam){
              this.paramTableData.tableData = eval('(' + dataSet.tplParam + ')')
            }
            this.sqlColumnTableData.tableData = dataSet.columns?dataSet.columns:[];
            this.sqlColumnTableData.tablePage.pageTotal = dataSet.columns?this.sqlColumnTableData.tableData.length:0
            this.paginationForm.isPagination = dataSet.isPagination ;
            this.paginationForm.pageCount = ""+dataSet.pageCount;
            this.sqlForm.datasetName = dataSet.datasetName;
            this.sqlForm.datasourceId = dataSet.datasourceId;
            this.sqlForm.id = dataSet.id;
            this.sqlForm.sqlType = dataSet.sqlType;
            if(dataSet.sqlType == 2)
            {
                this.procedureInParamTableData.tableData = JSON.parse(dataSet.inParam);
                this.procedureOutParamTableData.tableData = JSON.parse(dataSet.outParam);
            }
            this.getReportTplDateSource();
        },
        //删除数据集
        deleteDataSet(dataSet){
            let params = {
                url:this.apis.reportDesign.deleteDataSetApi,
                messageContent:this.commonUtil.getMessageFromList("confirm.delete",null),
                callback:this.deleteDataSetCallback,
                params:{id:dataSet.id},
                type:"get",
            }
            //弹出删除确认框
            this.commonUtil.showConfirm(params)
            },
        //添加数据集
        addDataSet(){
            let reportTplId=this.$route.query.tplId;;//reportTplId
            let paginationValidate = true;
            let tplSql = "";
            if(this.datasourceType == "1")
            {
                tplSql = this.sqlText;
                if(tplSql == null || tplSql == "")
                {
                    this.commonUtil.showMessage({message:"sql语句不能为空",type: this.commonConstants.messageType.error})
                    return;
                }
                if(this.sqlForm.sqlType == "1")
                {
                    this.$refs['paginationRef'].validate((valid) => {
                        if (valid){

                        }else{
                            paginationValidate = false;
                        }
                    })
                }else{
                    this.paginationForm.isPagination = "2";
                    this.paginationForm.pageCount = "100";
                }
                if(!paginationValidate)
                {
                    return;
                }
            }
            
            this.$refs['sqlRef'].validate((valid) => {
                if (valid) {
                    let obj = {
                        url:this.apis.reportDesign.addDataSetApi,
                        params:{tplId:reportTplId,datasetType:this.datasourceType,sqlType:this.sqlForm.sqlType,tplSql:tplSql,tplParam:this.paramTableData.tableData?JSON.stringify(this.paramTableData.tableData):"",datasourceId:this.sqlForm.datasourceId,datasetName:this.sqlForm.datasetName,id:this.sqlForm.id,
                        inParam:this.procedureInParamTableData.tableData?JSON.stringify(this.procedureInParamTableData.tableData):"",outParam:this.procedureOutParamTableData.tableData?JSON.stringify(this.procedureOutParamTableData.tableData):"",
                        isPagination:this.paginationForm.isPagination,pageCount:this.paginationForm.pageCount},
                        removeEmpty:false,
                    }
                    this.commonUtil.doPost(obj) .then(response=>{
                        if (response.code == "200")
                        {
                            this.getDataSets();
                            // let isExist = false;
                            // let dataSet = response.responseData;
                            // let index = -1;
                            // for(let i=0;i<this.datasets.length;i++)
                            // {
                            //     if(this.datasets[i].datasetName == dataSet.datasetName)
                            //     {
                            //         this.datasets[i] = dataSet;
                            //         isExist = true;
                            //         index = i;
                            //         break;
                            //     }
                            // }
                            // if(!isExist)
                            // {
                            //     this.datasets.push(dataSet);
                            //     this.activeDatasetsName = dataSet.datasetName;
                            // }else{
                            //     this.activeDatasetsName = this.datasets[index].datasetName;
                            // }
                            this.closeAddDataSet();
                            var sheetIndex = luckysheet.getSheet().index
                            luckysheet.sendServerMsg("reportDesign", sheetIndex,{"datasetName":obj.params.datasetName},{ "k": "datasetChanged"});
                        }
                    });
                }else{
                return;
                }
            });
        },
        //保存模板
        saveTpl(){
            this.loadingText = "模板保存中...";
            this.loading = true;
            var luckysheetfiles = luckysheet.getLuckysheetfile();
            if(luckysheetfiles)
            {
                var params = {};
                var sheetConfigs = [];
                for (let index = 0; index < luckysheetfiles.length; index++) {
                    const luckysheetfile = luckysheetfiles[index];
                    if(!luckysheetfile.isPivotTable)
                    {
                        var cellDatas = this.getCellDatas(luckysheetfile);
                        var extraCustomCellConfigs = this.getSheetExtraCustomCellConfigs(cellDatas,luckysheetfile.index);
                        var configs = this.getSheetConfigs(luckysheetfile);
                        configs.luckysheetAlternateformatSave = luckysheetfile.luckysheet_alternateformat_save;
                        var emptyMergeCell = this.getEmptyMergeCell(configs.config.merge, cellDatas)
                        cellDatas = cellDatas.concat(emptyMergeCell)
                        var borderCellDatas = this.getEmptyBorderCellDatas(configs.config,cellDatas);
                        cellDatas =  cellDatas.concat(borderCellDatas);
                        var dataVerificationCells = this.getEmptyDataVerificationCells(configs.dataVerification, cellDatas);
                        cellDatas = cellDatas.concat(dataVerificationCells)
                        if(cellDatas && cellDatas.length > 0)
                        {
                            var sheetCellFormats = this.cellFormats[luckysheetfile.index];
                            if(sheetCellFormats)
                            {
                                for (let index = 0; index < cellDatas.length; index++) {
                                    const element = cellDatas[index];
                                    var ct = sheetCellFormats[element.r+"_"+element.c];
                                    if(ct)
                                    {
                                        element.v.ct = ct;
                                    }
                                }
                            }
                        }
                        if(this.blockData[luckysheetfiles[index].index] && this.blockData[luckysheetfiles[index].index].length>0)
                        {//有循环块则需区分，将循环块的单元格单独保存，并且将循环块作为一个单元格保存
                            var blockCellMap = {};
                            var cellDatasMap = this.cellDatasToMap(cellDatas);
                            var reportTplCells = [];
                            var reportTplBlockCells = [];
                            for (let t = 0; t < this.blockData[luckysheetfiles[index].index].length; t++) {
                                var element = this.blockData[luckysheetfiles[index].index][t];
                                var blockCellDatas = [];
                                var blockInfos = this.getBlockInfos(element);
                                var blockCells = this.getBlockCells(blockInfos.startx,blockInfos.starty,blockInfos.rowspan,blockInfos.colspan);
                                var reportTplBlockCell = {
                                    r:blockInfos.startx,
                                    c:blockInfos.starty,
                                    rs:blockInfos.rowspan,
                                    cs:blockInfos.colspan,
                                    aggregateType: blockInfos.aggregateType,
                                    groupProperty: blockInfos.groupProperty
                                }
                                reportTplBlockCells.push(reportTplBlockCell);
                                for (let i = 0; i < blockCells.length; i++) {
                                    const blockCell = blockCells[i];
                                    var data = cellDatasMap[blockCell];
                                    if(data)
                                    {
                                        blockCellDatas.push(data);
                                        delete cellDatasMap[blockCell]
                                    }
                                }
                                blockCellMap[blockInfos.startx+"_"+blockInfos.starty] = blockCellDatas;
                            }
                            Object.keys(cellDatasMap).forEach(function(key){
                                reportTplCells.push(cellDatasMap[key]);
                            });
                            configs.cellDatas = reportTplCells;
                            configs.blockCellDatas = reportTplBlockCells;
                            configs.blockCells = blockCellMap;
                        }else{
                            //无循环块则直接保存所有的单元格信息即可
                            configs.cellDatas = cellDatas;
                        }
                        configs.extraCustomCellConfigs = extraCustomCellConfigs;
                        var chartCells = this.getChartCells(luckysheetfile);
                        var checkResult = this.checkChartFirstCellIsUsed(chartCells,cellDatas)
                        if(checkResult)
                        {
                          this.loading = false;
                          this.commonUtil.showMessage({message:"图表左上角对应的单元格已被使用，请重新设置图表的位置。",type: "error"})
                          return;
                        }
                        var chartXaxisData = this.sheetChartxAxisDatas[luckysheetfile.index]
                        var xxbtScreenShot = this.getXxbtScreenShot(luckysheetfile);
                        configs.chartXaxisData = chartXaxisData;
                        configs.chartCells = chartCells;
                        configs.xxbtScreenShot = xxbtScreenShot;
                        var printSettings = this.sheetPrintSettings[luckysheetfiles[index].index];
                        if(printSettings)
                        {
                          configs.printSettings = printSettings;
                        }
                        sheetConfigs.push(configs);
                    }
                }
                let reportTplId=this.$route.query.tplId;
                params.tplId = reportTplId;
                params.isParamMerge = this.isParamMerge?"1":"2";
                params.configs = sheetConfigs;
                params.delSheetsIndex = this.delSheetsIndex;
                let param = {
                    url:this.apis.reportDesign.saveLuckySheetTplApi,
                    params:params,
                    callback:this.doPostCallback
                }
                var _this = this;
                this.commonUtil.doPost(param) .then(response=>{
                    if (response.code == "200")
                    {
                      let printSettings = response.responseData.printSettings;
                      if(printSettings)
                      {
                        for(var i in printSettings)
                        {
                          _this.sheetPrintSettings[i].id = printSettings[i];
                        }
                      }
                        // this.refreshTpl();
                        // _this.getTplSettings();
                    }
                });
            }
        },
        //获取没有内容的边框单元格
        getEmptyBorderCellDatas(config,cellDatas){
            var result = [];
            if(config != null)
            {
                var borderinfo = config.borderInfo;
                if(borderinfo != null)
                {
                    var obj = this.cellDatasToJsonObj(cellDatas);
                    var cells = this.getBorderCells(borderinfo);
                    if(cells && cells.length>0)
                    {
                        for (let index = 0; index < cells.length; index++) {
                            const element = cells[index];
                            var cellObj = obj[element];
                            if(!cellObj)
                            {
                                var r = parseInt(element.split("-")[0]);
                                var c = parseInt(element.split("-")[1]);
                                var cellData = {
                                    "r":r,
                                    "c":c,
                                    "v":{
                                        "ct": {
                                            "fa": "General",
                                            "t": "g"
                                        },
                                        "v": "",
                                        "m": ""
                                    }
                                }
                                result.push(cellData)
                            }
                        }
                    }
                }
            }
           return result;
        },
        getEmptyMergeCell(merge, cellDatas) {
            var result = []
            if (merge && Object.keys(merge).length > 0) {
              var obj = this.cellDatasToJsonObj(cellDatas)
              Object.keys(merge).forEach((key) => {
                var value = merge[key]
                var r = value.r
                var c = value.c
                if (!obj[r + '-' + c]) {
                  var cellData = {
                    'r': r,
                    'c': c,
                    'v': {
                      'ct': {
                        'fa': 'General',
                        't': 'g'
                      },
                      'v': '',
                      'm': '',
                      'mc': {
                        'r': r,
                        'c': c,
                        'rs': value.rs,
                        'cs': value.cs
                      }
                    }
      
                  }
                  result.push(cellData)
                }
              })
            }
            return result
          },
        //获取有边框的单元格
        getBorderCells(borderinfo){
            var result = new Array();
            for (let index = 0; index < borderinfo.length; index++) {
                const element = borderinfo[index];
                if(element.rangeType && element.rangeType=="range")
                {
                    var borderType = element.borderType;
                    if(borderType=="border-all" || borderType=="border-left" || borderType=="border-right" ||
                    borderType=="border-top" || borderType=="border-bottom")
                    {
                        var ranges = element.range;
                        for (let t = 0; t < ranges.length; t++) {
                            const range = ranges[t];
                            var row = range.row;
                            var column = range.column;
                            var startRow = row[0];
                            var startCol = column[0];
                            var rowAmount = row[1]-row[0]+1;
                            var colAmount = column[1]-column[0]+1;
                            for(var i = 0;i<rowAmount;i++){
                                for(var j = 0;j<colAmount;j++)
                                {
                                    var coor = (startRow+i) + "-" + (startCol+j);
                                    if(result.indexOf(coor)<0)
                                    {
                                        result.push(coor);
                                    }
                                    
                                }
                            }
                        }
                    }else if(borderType=="border-none")
                    {
                        var ranges = element.range;
                        for (let t = 0; t < ranges.length; t++) {
                            const range = ranges[t];
                            var row = range.row;
                            var column = range.column;
                            var startRow = row[0];
                            var startCol = column[0];
                            var rowAmount = row[1]-row[0]+1;
                            var colAmount = column[1]-column[0]+1;
                            for(var i = 0;i<rowAmount;i++){
                                for(var j = 0;j<colAmount;j++)
                                {
                                    var coor = (startRow+i) + "-" + (startCol+j);
                                    if(result.indexOf(coor)>=0)
                                    {
                                        result.splice(result.indexOf(coor),1);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result;
        },
        cellDatasToJsonObj(data){
            var obj = {};
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if(element.v.mc)
                {
                    var r = element.r;
                    var c = element.c;
                    var rs = element.v.mc.rs;
                    var cs = element.v.mc.cs;
                    for (let i = 0; i < rs; i++) {
                       for (let t = 0; t < cs; t++) {
                            obj[(r+i)+'-'+(c+t)] = "1";
                       }
                    }
                }else{
                    obj[element.r+'-'+element.c] = "1";
                }
                
            }
            return obj;
        },
        //获取空的数据校验项
    getEmptyDataVerificationCells(dataVerification,cellDatas){
        var result = [];
        if(dataVerification && Object.keys(dataVerification).length > 0)
        {
          var obj = this.cellDatasToJsonObj(cellDatas);
          Object.keys(dataVerification).forEach((key) => {
            var r = parseInt(key.split("_")[0]);
            var c = parseInt(key.split("_")[1]);
            if (!obj[r + '-' + c]) {
              var cellData = {
                'r': r,
                'c': c,
                'v': {
                  'ct': {
                    'fa': 'General',
                    't': 'g'
                  },
                  'v': '',
                  'm': '',
                }
              }
              result.push(cellData)
            }
          })
        }
        return result;
      },
        //获取自定义单元格配置
        getSheetExtraCustomCellConfigs(cellDatas,sheetIndex){
            var result = {};
            if(cellDatas && cellDatas.length>0)
            {
                for (let index = 0; index < cellDatas.length; index++) {
                    const element = cellDatas[index];
                    if(this.extraCustomCellConfigs[sheetIndex])
                    {
                        var obj = this.extraCustomCellConfigs[sheetIndex][element.r+"_"+element.c];
                        if(obj)
                        {
                            result[element.r+"_"+element.c] = obj;
                        }
                    }
                }
            }
            return result;
        },
        //获取自定义单元格配置
        getExtraCustomCellConfigs(cellDatas){
            var result = {};
            if(cellDatas && cellDatas.length>0)
            {
                for (let index = 0; index < cellDatas.length; index++) {
                    const element = cellDatas[index];
                    var obj = this.extraCustomCellConfigs[element.r+"_"+element.c];
                    if(obj)
                    {
                        result[element.r+"_"+element.c] = obj;
                    }
                }
            }
            return result;
        },
        getSheetConfigs(luckysheetfile){
            var result = {};
            // result.title = json.title;
            result.hyperlinks = luckysheetfile.hyperlink
            result.config = luckysheetfile.config;
            result.frozen = luckysheetfile.frozen;
            result.images = luckysheetfile.images;
            result.sheetIndex = luckysheetfile.index;
            result.calcChain = luckysheetfile.calcChain;
            result.sheetName = luckysheetfile.name;
            result.sheetOrder = luckysheetfile.order;
            result.dataVerification = luckysheetfile.dataVerification;
            result.pageDivider = luckysheetfile.pageDivider;
            if(luckysheetfile.chart && luckysheetfile.chart.length > 0){
                for (let index = 0; index < luckysheetfile.chart.length; index++) {
                  const chart = luckysheetfile.chart[index];
                  let div = document.getElementById(chart.chart_id + '_c');
                  if(div && div.style) {
                    chart.left = parseInt(div.style.left)
                    chart.top = parseInt(div.style.top)
                    chart.width = parseInt(div.style.width)
                    chart.height = parseInt(div.style.height)
                    var offsetings = this.chartOffsetings[chart.chart_id];
                    if(offsetings)
                    {
                      chart.offsetHeight = parseInt(offsetings.offsetHeight)
                      chart.offsetWidth = parseInt(offsetings.offsetWidth)
                    }else{
                      chart.offsetHeight = parseInt(div.offsetHeight)
                      chart.offsetWidth = parseInt(div.offsetWidth)
                    }
                  }
                }
              }
              result.chart = luckysheetfile.chart;
              if(this.sheetRangeAuth[luckysheetfile.index]){
                result.sheetRangeAuth = this.sheetRangeAuth[luckysheetfile.index];
              }
            return result;
        },
        getChartCells(luckysheetfile){
            var chartCells = [];
            if(luckysheetfile.chart && luckysheetfile.chart.length > 0){
                var columnlen = luckysheetfile.config.columnlen;
                var rowlen = luckysheetfile.config.rowlen;
                for (let index = 0; index < luckysheetfile.chart.length; index++) {
                  let left = 0;
                  let leftEnd = 0;
                  let top = 0;
                  let topEnd = 0;
                  const element = luckysheetfile.chart[index];
                  let chartLeft = element.left;
                  let chartLeftEnd = element.left + element.offsetWidth;
                  let chartTop = element.top;
                  let chartTopEnd = element.top + element.offsetHeight;
                  let cellLeft = 0;//距离单元格左侧的距离
                  let cellTop = 0;//距离单元格上方的距离
                  let temp = 0;
                  //计算chart的横纵坐标
                  let y = 0;
                  while(left < chartLeft)
                  {
                    if(columnlen && columnlen[(y+"")])
                    {
                      left = left + columnlen[(y+"")]*1;
                    }else{
                      left = left + 73;
                    }
                    if(left < chartLeft)
                    {
                      y = y + 1
                      // cellLeft = chartLeft - temp;
                      // temp = 0;
                    }
                    left = left + 1;
                    // else{
                    //   temp = left;
                    // }
                  }
                  let yend = 0;
                  while(leftEnd < chartLeftEnd)
                  {
                    if(columnlen && columnlen[(yend+"")])
                    {
                      leftEnd = leftEnd + columnlen[(yend+"")]*1;
                    }
                    else{
                      leftEnd = leftEnd + 73;
                    }
                    if(leftEnd < chartLeftEnd)
                    {
                      yend = yend + 1
                    }
                    leftEnd = leftEnd + 1;
                  }
                  let x = 0;
                  while(top < chartTop)
                  {
                    if(rowlen && rowlen[(x+"")])
                    {
                      top = top + rowlen[(x+"")]*1
                    }else{
                      top = top + 19
                    }
                    if(top < chartTop)
                    {
                      x = x + 1;
                    }
                    top = top + 1;
                  }
                  let xend = 0;
                  while(topEnd < chartTopEnd)
                  {
                    if(rowlen && rowlen[(xend+"")])
                    {
                      topEnd = topEnd + rowlen[(xend+"")]*1;
                    }else{
                      topEnd = topEnd + 19;
                    }
                    if(topEnd < chartTopEnd)
                    {
                      xend = xend + 1
                    }
                    topEnd = topEnd + 1;
                  }
                  var cell = {
                    r:x,
                    c:y,
                    v: {
                      "ct": {
                          "t": "g",
                          "fa": "General"
                      },
                      "v": "",
                      "m": ""
                    },
                    chartId:luckysheetfile.chart[index].chart_id
                  }
                  if((xend-x)>0 || (yend-y)>0)
                  {
                    cell.v.mc={
                      r:x,
                      c:y,
                      rs:xend-x+1,
                      cs:yend-y+1
                    }
                  }
                  chartCells.push(cell)
                }
            }
            return chartCells;
          },
          //校验图表第一个单元格是否有输入内容，有的话返回false并抛出异常
          checkChartFirstCellIsUsed(chartCells,cellDatas){
            var result = false;
            if(chartCells && chartCells.length > 0 && cellDatas && cellDatas.length > 0)
            {
              for (let index = 0; index < chartCells.length; index++) {
                const chartCell = chartCells[index];
                var chartr = chartCell.r;
                var chartc = chartCell.c;
                for (let t = 0; t < cellDatas.length; t++) {
                  const cellData = cellDatas[t];
                  var r = cellData.r;
                  var c = cellData.c;
                  var mc = cellData.v.mc;
                  if(mc)
                  {
                    var rs = mc.rs;
                    var cs = mc.cs;
                    if(chartr>=r && chartr<=(r+rs-1) && chartc>=c && chartc<=(c+cs-1))
                    {
                      result = true;
                      break;
                    }
                  }else{
                    if(chartr == r && chartc == c)
                    {
                      result = true;
                      break;
                    }
                  }
                }
                if(result)
                {
                  break;
                }
              }
            }
            return result;
          },
        getTplSettings(){
            let reportTplId=this.$route.query.tplId;
            let param = {
                url:this.apis.reportDesign.getLuckySheetTplSettingsApi,
                params:{id:reportTplId},
            }
            var _this = this;
            this.loading = true;
            this.loadingText = "模板数据加载中..."
            param.callback = this.doPostCallback
            this.commonUtil.doPost(param) .then(response=>{
                if (response.code == "200")
                {
                    var charts = [];
                    if(response.responseData && response.responseData.settings)
                    {
                        _this.sheetOptions.data = [];
                        _this.tplName = response.responseData.tplName;
                        _this.sheetRangeAuth = response.responseData.sheetRangeAuth;
                        _this.isCreator = response.responseData.creator;
                        _this.creatorName = response.responseData.creatorName;
                        for (let index = 0; index < response.responseData.settings.length; index++) {
                            const element = response.responseData.settings[index];
                            element.config.curentsheetView = null;
                            var cellDatas = {
                                celldata:element.cellDatas,
                                hyperlink:element.hyperlinks,
                                config:element.config,
                                frozen:element.frozen,
                                images:element.images,
                                calcChain:element.calcChain,
                                index:element.sheetIndex,
                                name:element.sheetName,
                                order:element.sheetOrder,
                                isPivotTable:false,
                                pivotTable:null,
                                luckysheet_alternateformat_save:element.luckysheetAlternateformatSave,
                                chart:element.chart,
                                dataVerification:element.dataVerification,
                                pageDivider:element.pageDivider
                            }
                            if(!_this.isCreator)
                            {
                              if(_this.sheetRangeAuth)
                              {
                                if(_this.sheetRangeAuth[element.sheetIndex])
                                {
                                  let range = [];
                                  for(var key in _this.sheetRangeAuth[element.sheetIndex]) {
                                    range.push(_this.sheetRangeAuth[element.sheetIndex][key].range)
                                  }
                                  cellDatas.authrange = range;
                                }
                              }
                            }
                            if(element.chart)
                            {
                              charts = charts.concat(element.chart)
                            }
                            _this.sheetOptions.data.push(cellDatas);
                            _this.cellFormats[element.sheetIndex] = element.cellFormats
                            if(element.blockData)
                            {
                                _this.blockData[element.sheetIndex] = element.blockData;
                                if(index == 0)
                                {
                                    _this.sheetBlockData = element.blockData;
                                }
                            }
                            if(element.extraCustomCellConfigs)
                            {
                                _this.extraCustomCellConfigs[element.sheetIndex] = element.extraCustomCellConfigs
                            }else{
                                _this.extraCustomCellConfigs[element.sheetIndex] = {}
                            }
                            if(element.chartXaxisData)
                            {
                                _this.sheetChartxAxisDatas[element.sheetIndex] = element.chartXaxisData;
                                if (index == 0) {
                                  _this.chartxAxisData = element.chartXaxisData
                                }
                            }
                            if(element.reportSheetPdfPrintSetting)
                            {
                              _this.sheetPrintSettings[element.sheetIndex] = element.reportSheetPdfPrintSetting;
                            }
                        }
                    }
                    _this.isParamMerge = response.responseData.isParamMerge=="1"?true:false
                    _this.init(charts);
                }
            });
        },
        //预览
        previewReport(){
            let reportTplId=this.$route.query.tplId;;//reportTplId
            let viewReport = this.$router.resolve({ name: 'luckyReportPreview',query: {tplId:reportTplId}});
            window.open(viewReport.href, '_blank');
        },
        //添加循环块
        addBlock(){
            this.blockVisiable = true;
        },
        //关闭循环块对话框
        closeBlockDialog(){
            this.blockVisiable = false;
            this.$refs['blockRef'].resetFields();//校验重置
            this.commonUtil.clearObj(this.blockForm);
        },
        //确认添加循环块
        confirmAddBlock(){
            this.$refs['blockRef'].validate((valid) => {
                if (valid) {
                    var data = {
                        startCell:this.blockForm.startCell,
                        endCell:this.blockForm.endCell,
                        aggregateType: this.blockForm.aggregateType,
                        groupProperty: this.blockForm.groupProperty,
                    }
                    var sheetIndex = luckysheet.getSheet().index;
                    var k = "";
                    if(this.blockForm.index != null)
                    {
                      this.blockData[sheetIndex][this.blockForm.index] = data;
                      this.sheetBlockData = this.blockData[sheetIndex]
                      k = "editBlock";
                    }else{
                      if (!this.blockData[sheetIndex]) {
                        this.blockData[sheetIndex] = []
                      }
                      this.blockData[sheetIndex].push(data)
                      this.sheetBlockData = this.blockData[sheetIndex]
                      k = "addBlock";
                    }
                    var obj = {
                      value:this.blockForm
                    }
                    luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": k});
                    this.saveTplCache();
                    this.closeBlockDialog();
                }else{
                    return false;
                }
              });
        },
        //编辑循环块
        editBlock(obj,index)
        {
          this.blockForm.index = index
          this.blockForm.startCell = obj.startCell
          this.blockForm.endCell = obj.endCell
          this.blockForm.aggregateType = obj.aggregateType
          this.blockForm.groupProperty = obj.groupProperty
          this.blockVisiable = true
        },
        //删除循环块
        deleteBlock(index){
            var sheetIndex = luckysheet.getSheet().index;
            this.blockData[sheetIndex].splice(index,1)
            this.sheetBlockData = this.blockData[sheetIndex];
            var obj = {
              value:index
            }
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'deleteBlock'});
            this.saveTplCache();
            this.closeBlockDialog()
        },
        //获取循环块信息，起始横坐标，起始纵坐标，colspan，rowspan
        getBlockInfos(blockData){
            var result = {};
            var startCell = blockData.startCell;
            var endCell = blockData.endCell;
            var startx = startCell.replace(/[^0-9]/ig,"") - 1; 
            var starty = this.columnStringTonum(startCell.replace((startx+1),"")) - 1;
            var endx = endCell.replace(/[^0-9]/ig,"") - 1;
            var endy = this.columnStringTonum(endCell.replace((endx+1),"")) - 1;
            var rowspan = endx - startx + 1;
            var colspan = endy - starty + 1;
            var aggregateType = blockData.aggregateType
            var groupProperty = blockData.groupProperty
            result.startx = startx;
            result.starty = starty;
            result.rowspan = rowspan;
            result.colspan = colspan;
            result.aggregateType = aggregateType
            result.groupProperty = groupProperty
            return result;
        },
        //获取循环块的单元格
        getBlockCells(startx,starty,rowspan,colspan){
            var result = [];
            for (let i = 0; i < rowspan; i++) {
                for (let t = 0; t < colspan; t++) {
                    result.push((startx+i)+"-"+(starty+t));
                }
            }
            return result;
        },
        //列字母转数字
        columnStringTonum(a) {
            var str = a.toLowerCase().split("");
            var num = 0;
            var al = str.length;
            var getCharNumber = function (charx) {
                return charx.charCodeAt() - 96;
            };
            var numout = 0;
            var charnum = 0;
            for (var i = 0; i < al; i++) {
                charnum = getCharNumber(str[i]);
                numout += charnum * Math.pow(26, al - i - 1);
            };
            return numout;
        },
        //将celldatas转成map
        cellDatasToMap(cellDatas){
            var result = {};
            for (let index = 0; index < cellDatas.length; index++) {
                const element = cellDatas[index];
                result[element.r+"-"+element.c] = element;
            }
            return result;
        },
        isInputPassWord(){
            let reportTplId=this.$route.query.tplId;
            var obj = {
              url:this.apis.reportTpl.getDetailApi,
              params:{id:reportTplId},
            }
            this.commonUtil.doGet(obj).then(response=>{
              if(response.responseData.designPwd)
              {
                this.openInputPwd();
              }else{
                this.initTableSettings();
              }
            });
          },
          openInputPwd(){
            let reportTplId=this.$route.query.tplId;
            ElMessageBox.prompt('', '请输入密码', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'password',
              inputValidator: (value) => {       // 点击按钮时，对文本框里面的值进行验证
                if(!value) {
                    return '请输入密码';
                }
              },
            }).then(({ value }) => {
              var obj = {
                params:{id:reportTplId,designPwd:value},
                url:this.apis.reportTpl.validateDesignPwdApi
              }
              this.commonUtil.doPost(obj) .then(response=>{
                if(response.code == "200")
                {
                    this.initTableSettings();
                }else(
                    this.openInputPwd()
                )
              });
            }).catch(() => {
            });
          },
          initTableSettings(){
            this.getReportTplDateSource();
            this.getDataSets();
            this.getTplSettings();
          },
          async clickDatasets(o)
          {
              if(o.isActive)
              {
                //   this.$set(o,"isActive",false);
                o.isActive = false;
              }else{
                //   this.$set(o,"isActive",true);
                o.isActive = true;
                  if(!o.columns || o.columns == null || o.columns.length == 0)
                  {
                      await this.getDatasetColumns(o);
                  }
              }
              if(o.datasetType == "2")
              {
                this.getApiDefaultRequestResult(o);
              }
              this.$forceUpdate()
          },
          getDatasetColumns(element){
              let obj = {
                  url:this.apis.reportDesign.getDataSetColumnsApi,
                  params:{id:element.id},
                  removeEmpty:false,
              }
              this.commonUtil.doPost(obj) .then(response=>{
                  element.columns = response.responseData;
                  this.dataSetAttrs = element.columns;
              })
          },
          //获取api接口默认参数的返回值
            getApiDefaultRequestResult(element){
                let obj = {
                    url:this.apis.reportDesign.getApiDefaultRequestResultApi,
                    params:{id:element.id},
                    removeEmpty:false,
                }
                this.commonUtil.doPost(obj) .then(response=>{
                    element.apiResult = response.responseData.apiResult
                })
            },
          clickTab(index){
              this.tabIndex = index;
          },
          //引入Excel
      loadExcel(evt){
        const files = evt.target.files;
        if (files == null || files.length == 0) {
          alert("请选择文件");
          return;
        }

        //获取文件名
        let name = files[0].name;
        //获取文件后缀
        let suffixArr = name.split(".");
        const suffix = suffixArr[suffixArr.length - 1]
        if(this.uploadType == "xlsx"){
          if (suffix != 'xlsx') {
            this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("error.upload.filetype",['xlsx']), type: this.commonConstants.messageType.error })
            return
          }
        }else if(this.uploadType == "csv"){
          if (suffix != 'csv') {
            this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("error.upload.filetype",['csv']), type: this.commonConstants.messageType.error })
            return
          }
        }else{
          this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("error.upload.filetype",['xlsx/csv']), type: this.commonConstants.messageType.error })
          return;
        }
        this.loadingText="文件上传中，请耐心等待...";
        this.loading = true;
        var that = this;
        //转换导入的excel
        const formData = new FormData();
        formData.append("file",files[0]);
        formData.append("tplId",this.$route.query.tplId);
        let config = {
            headers: {'Content-Type': 'multipart/form-data',
            'Authorization':localStorage.getItem(that.commonConstants.sessionItem.authorization)}
        }
        try {
          Axios.post(that.apis.reportTpl.uploadReportTplApi, formData, config)
        .then(res => {
            if(res.data.code == "200")
            {
                let sheetDatas = res.data.responseData;
                var sameName = "";
                if(sheetDatas && sheetDatas.length > 0)
                {
                    var luckysheetfiles = luckysheet.getLuckysheetfile();
                    for (let index = 0; index < sheetDatas.length; index++) {
                        const element = sheetDatas[index];
                        var flag = false;
                        for (let index = 0; index < luckysheetfiles.length; index++) {
                          const luckysheetfile = luckysheetfiles[index];
                          if(luckysheetfile.name == element.name)
                          {
                            if(sameName)
                            {
                              sameName = sameName + "，"+luckysheetfile.name;
                            }else{
                              sameName = luckysheetfile.name;
                            }
                            flag = true;
                            break;
                          }
                        }
                        if(!flag)
                        {
                          var data = luckysheet.buildGridData(element);
                          element.data = data;
                          luckysheet.appendImportSheet(element,false)
                        }
                    }
                }
                if(sameName)
                {
                  that.commonUtil.showMessage({message:"sheet名称【"+sameName+"】已经存在。",type: "error"})
                }
            }else{
                that.commonUtil.showMessage({message:res.data.message,type: res.data.msgLevel})
            }
            that.loading = false;
            evt.target.value = ''
        })
        } catch (error) {
            evt.target.value = ''
            that.loading = false;
        }
      },
      setExtraCustomCellConfigs(r,c,obj){
        var sheetIndex = luckysheet.getSheet().index;
        if(!this.extraCustomCellConfigs[sheetIndex])
        {
            this.extraCustomCellConfigs[sheetIndex] = {};
        }
        this.extraCustomCellConfigs[sheetIndex][r+"_"+c] = obj;
      },
      getExtraCustomCellConfigs(r,c,sheetIndex){
        if(!sheetIndex)
        {
          sheetIndex = luckysheet.getSheet().index
        }
        if(this.extraCustomCellConfigs[sheetIndex])
        {
            return this.extraCustomCellConfigs[sheetIndex][r+"_"+c];
        }
        return null;
      },
      //切换sheet监听事件
      sheetActivate(index, isPivotInitial, isNewSheet){
        if(!this.blockData)
        {
            this.blockData = {};
        }
        this.sheetBlockData = [];
        if(this.blockData[index])
        {
            this.sheetBlockData = this.blockData[index];
        }
        this.chartxAxisData = this.sheetChartxAxisDatas[index];
      },
      //删除sheet监听
      sheetDeleteBefore(sheet){
        this.delSheetsIndex.push(sheet.sheet.index);
      },
      //创建sheet监听
      sheetCreateAfter(sheet)
      {
        var index = this.delSheetsIndex.indexOf(sheet.sheet.index);
        if(index > -1)
        {
            this.delSheetsIndex.splice(index,1);
        }else{
          var data = luckysheet.buildGridData(sheet.sheet);
          sheet.sheet.data = data;
          this.saveNewSheetCache(sheet);
        }
      },
      //sheet复制监听事件
      sheetCopyBefore(object){
        var oldSheet = object.targetSheet;
        var newSheet = object.copySheet;
        var extraConfig = this.extraCustomCellConfigs[oldSheet.index];
        if(extraConfig)
        {
            var newExtraConfig = JSON.parse(JSON.stringify(extraConfig));
            this.extraCustomCellConfigs[newSheet.index] = newExtraConfig;
        }
        var blockData = this.blockData[oldSheet.index];
        if(blockData)
        {
            var newBlockData = JSON.parse(JSON.stringify(blockData));
            this.blockData[newSheet.index] = newBlockData;
        }
      },
      //是否预警事件
      changeIsWarning(){
        var cells = this.getSelectRangeCells();
        if(cells && cells.length>0)
        {
            for (let index = 0; index < cells.length; index++) {
                const element = cells[index];
                var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                if(obj)
                {
                    obj.warning = this.cellForm.warning;
                    obj.warningRules = this.cellForm.warningRules
                    obj.threshold = this.cellForm.threshold;
                    obj.warningColor = this.cellForm.warningColor;
                }else{
                    obj = {};
                    obj.warning = this.cellForm.warning;
                    obj.warningRules = this.cellForm.warningRules
                    obj.threshold = this.cellForm.threshold;
                    obj.warningColor = this.cellForm.warningColor;
                    this.setExtraCustomCellConfigs(element[0],element[1],obj);
                }
            }
            var obj = {
              cells:cells,
              value:this.cellForm['warning']
            }
            const sheetIndex = luckysheet.getSheet().index;
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'warning'});
            this.saveTplCache();
        }
      },
      //预警阈值事件
      changeThreshold(){
        var cells = this.getSelectRangeCells();
        if(cells && cells.length>0)
        {
            for (let index = 0; index < cells.length; index++) {
                const element = cells[index];
                var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                if(obj)
                {
                    obj.threshold = this.cellForm.threshold;
                }else{
                    obj = {};
                    obj.threshold = this.cellForm.threshold;
                    this.setExtraCustomCellConfigs(element[0],element[1],obj);
                }
            }
            var obj = {
              cells:cells,
              value:this.cellForm['threshold']
            }
            const sheetIndex = luckysheet.getSheet().index;
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'threshold'});
            this.saveTplCache();
        }
      },
      //预警阈值颜色事件
      changeWarningColor(){
        var cells = this.getSelectRangeCells();
        if(cells && cells.length>0)
        {
            for (let index = 0; index < cells.length; index++) {
                const element = cells[index];
                var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                if(obj)
                {
                    obj.warningColor = this.cellForm.warningColor;
                }else{
                    obj = {};
                    obj.warningColor = this.cellForm.warningColor;
                    this.setExtraCustomCellConfigs(element[0],element[1],obj);
                }
            }
            var obj = {
              cells:cells,
              value:this.cellForm['warningColor']
            }
            const sheetIndex = luckysheet.getSheet().index;
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'warningColor'});
            this.saveTplCache();
        }
      },
      changeWarningContent(){
        var cells = this.getSelectRangeCells();
        if(cells && cells.length>0)
        {
            for (let index = 0; index < cells.length; index++) {
                const element = cells[index];
                var obj = this.getExtraCustomCellConfigs(element[0],element[1]);
                if(obj)
                {
                    obj.warningContent = this.cellForm.warningContent;
                }else{
                    obj = {};
                    obj.warningContent = this.cellForm.warningContent;
                    this.setExtraCustomCellConfigs(element[0],element[1],obj);
                }
            }
            var obj = {
              cells:cells,
              value:this.cellForm['warningContent']
            }
            const sheetIndex = luckysheet.getSheet().index;
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'warningContent'});
            this.saveTplCache();
        }
      },
      //修改单元格格式监听事件
      updateCellFormat(r,c,foucsStatus,type){
        var sheetIndex = luckysheet.getSheet().index;
        var sheetCellFormats = this.cellFormats[sheetIndex];
        if(sheetCellFormats)
        {
            var ct = sheetCellFormats[r+"_"+c];
            if(ct)
            {
                ct.t = type;
                ct.f = foucsStatus;
            }
        }
      },
      //单元格鼠标点击监听事件
      cellMousedown(cell,postion,sheetFile,ctx){
        var selectedRanges = luckysheet.getRange();
        var r = selectedRanges[0].row[0];
        var c = selectedRanges[0].column[0];
        var sheetIndex = luckysheet.getSheet().index;
        var sheetCellFormats = this.cellFormats[sheetIndex];
        var order = luckysheet.getSheet().order;
        if(sheetCellFormats)
        {
            var ct = sheetCellFormats[r+"_"+c];
            if (ct && ct.t && ct.t == "inlineStr") {
           
            }else{
              if(ct)
              {
                luckysheet.setCellFormat(r, c, 'ct', ct, { order: order })
              }
            }
        }
      },
      // 
      changeCellAttr(attr) {
        var cells = this.getSelectRangeCells()
        if (cells && cells.length > 0) {
          for (let index = 0; index < cells.length; index++) {
            const element = cells[index]
            var obj = this.getExtraCustomCellConfigs(element[0], element[1])
            if (obj) {
              obj[attr] = this.cellForm[attr];
            } else {
              obj = {}
              obj[attr] = this.cellForm[attr];
            }
            this.setExtraCustomCellConfigs(element[0],element[1],obj);  
          }
          var obj = {
            cells:cells,
            value:this.cellForm[attr]
          }
          const sheetIndex = luckysheet.getSheet().index;
          luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": attr});
          this.saveTplCache();
        }
        if(attr == "datasourceId")
        {
          this.getDatasourceAttr();
        }else if("isDrill" == attr){
          if(this.cellForm[attr])
          {
            this.getDrillReport();
          }
        }
      },
      //获取数据源的数据字典类型
      getDatasourceAttr(){
        let obj = {
            url:this.apis.reportDatasourceDictType.getDatasourceDictTypesApi,
            params:{datasourceId:this.cellForm.datasourceId},
            removeEmpty:false,
        }
        this.commonUtil.doPost(obj) .then(response=>{
            if (response.code == "200")
            {
                this.dictTypes = response.responseData;
            }
        });
     },
     getMaxSheetOrder(){
        var luckysheetfiles = luckysheet.getLuckysheetfile();
        let order = 0;
        if(luckysheetfiles)
        {
          for (let index = 0; index < luckysheetfiles.length; index++) {
            const element = luckysheetfiles[index];
            if(element.order > order)
            {
              order = element.order;
            }
          }
        }
        return order;
      },
      addCellConditions(){
        this.cellConditionVisiable = true;
      },
      closeCellConditionDialog(){
        this.$refs['conditionRef'].resetFields();
        this.commonUtil.clearObj(this.cellConditionForm);
        this.cellConditionForm.index = null;
        this.cellConditionVisiable = false;
      },
      // 确认单元格过滤
      confirmAddCellCondition() {
        this.$refs['conditionRef'].validate((valid) => {
          if (valid) {
            if(this.cellConditionForm.index != null)
            {//修改属性
              this.cellForm.cellconditions[this.cellConditionForm.index].property = this.cellConditionForm.property;
              this.cellForm.cellconditions[this.cellConditionForm.index].operator = this.cellConditionForm.operator;
              this.cellForm.cellconditions[this.cellConditionForm.index].type = this.cellConditionForm.type;
              this.cellForm.cellconditions[this.cellConditionForm.index].value = this.cellConditionForm.value;
              this.cellForm.cellconditions[this.cellConditionForm.index].dateFormat = this.cellConditionForm.dateFormat;
            }else{
              var data = {
                property: this.cellConditionForm.property,
                operator: this.cellConditionForm.operator,
                type: this.cellConditionForm.type,
                value: this.cellConditionForm.value,
                dateFormat: this.cellConditionForm.dateFormat
              }
              if(!this.cellForm.cellconditions)
              {
                this.cellForm.cellconditions = [];
              }
              this.cellForm.cellconditions.push(data);
            }
            this.changeCellAttr("cellconditions");
            this.closeCellConditionDialog();
          } else {
            return false
          }
        })
      },
      deleteCellCondition(index){
        this.cellForm.cellconditions.splice(index, 1)
        this.changeCellAttr("cellconditions");
      },
      editCellCondition(index){
        let cellCondition = this.cellForm.cellconditions[index];
        this.cellConditionForm.property = cellCondition.property;
        this.cellConditionForm.operator = cellCondition.operator;
        this.cellConditionForm.type = cellCondition.type;
        this.cellConditionForm.value = cellCondition.value;
        this.cellConditionForm.dateFormat = cellCondition.dateFormat;
        this.cellConditionForm.index = index;
        this.cellConditionVisiable = true;
      },
      copyCellCondition(row){
        this.cellConditionForm.property = row.property;
        this.cellConditionForm.operator = row.operator;
        this.cellConditionForm.type = row.type;
        this.cellConditionForm.value = row.value;
        this.cellConditionForm.dateFormat = row.dateFormat;
        this.cellConditionForm.index = null;
        this.cellConditionVisiable = true;
      },
      addxAxisData(){
        this.dataSetAttrs = [];
        this.getSheetCharts();
        this.xAxisVisiable = true;
      },
      closexAxisData(){
        this.xAxisVisiable = false;
        this.$refs['xAxisRef'].resetFields();
        this.commonUtil.clearObj(this.xAxisForm)
      },
      //获取sheet页中的图表
      getSheetCharts(){
        var luckysheetfile = luckysheet.getSheet();
        this.sheetCharts = [];
        if(luckysheetfile.chart && luckysheetfile.chart.length > 0)
        {
          for (let index = 0; index < luckysheetfile.chart.length; index++) {
            const chart = luckysheetfile.chart[index];
            var chartObj = {
              chartId:chart.chart_id,
              title:chart.chartOptions.defaultOption.title.text
            }
            this.sheetCharts.push(chartObj);
          }
        }
        this.chartxAxisData = this.sheetChartxAxisDatas[luckysheetfile.index];
      },
      getDatasetAttrs(){
        for (let index = 0; index < this.datasets.length; index++) {
          const element = this.datasets[index];
          if(element.id == this.xAxisForm.datasetId)
          {
            if(element.columns && element.columns.length > 0)
            {
              this.dataSetAttrs = element.columns;
            }else{
              this.getDatasetColumns(element)
            }
            this.xAxisForm.datasetName = element.datasetName
            break;
          }
        }
      },
      getChartTile(){
        for (let index = 0; index < this.sheetCharts.length; index++) {
          const element = this.sheetCharts[index];
          if(element.chartId == this.xAxisForm.chartId)
          {
            this.xAxisForm.title = element.title;
            break;
          }
        }
      },
      confirmAddxAxisData(){
        var that = this;
        this.$refs['xAxisRef'].validate((valid) => {
          if(valid){
            var sheetIndex = luckysheet.getSheet().index;
            var obj = {
              chartId:that.xAxisForm.chartId,
              title:that.xAxisForm.title,
              dataType:that.xAxisForm.dataType,
              datasetId:that.xAxisForm.datasetId,
              attr:that.xAxisForm.attr,
              xAxisDatas:that.xAxisForm.xAxisDatas,
              datasetName:that.xAxisForm.datasetName,
            }
            if(that.xAxisForm.dataType == 1)
            {
              try {
                var test = eval('(' + that.xAxisForm.xAxisDatas + ')');
                if(!(test instanceof Array))
                {
                  this.commonUtil.showMessage({message:"x轴数据请输入数组格式的数据，例如['a','b','c']",type: "error"})
                  return;
                }
              } catch (error) {
                this.commonUtil.showMessage({message:"x轴数据请输入数组格式的数据，例如['a','b','c']",type: "error"})
                return;
              }
            }
            
            if(!that.sheetChartxAxisDatas[sheetIndex])
            {
              that.sheetChartxAxisDatas[sheetIndex] = [];
            }
            let k = "";
            if(that.xAxisForm.index == null)
            {
              var index = this.isAddChart(that.xAxisForm.chartId);
              if(index >=0)
              {
                that.xAxisForm.index = index;
              }
            }
            if(that.xAxisForm.index != null)
            {
              that.sheetChartxAxisDatas[sheetIndex][that.xAxisForm.index] = obj;
            //   that.$set(that.chartxAxisData,that.xAxisForm.index,obj);
              that.chartxAxisData[that.xAxisForm.index] = obj;
              k = "editXaxis";
            }else{
              that.sheetChartxAxisDatas[sheetIndex].push(obj);
              that.chartxAxisData = that.sheetChartxAxisDatas[sheetIndex];
              k = "addXaxis";
            }
            var obj = {
              value:that.xAxisForm
            }
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": k});
            this.saveTplCache();
            that.closexAxisData();
          }
        })
      },
      editxAxisData(row,index){
        this.xAxisVisiable = true;
        this.xAxisForm.chartId = row.chartId;
        this.xAxisForm.title = row.title;
        this.xAxisForm.dataType = row.dataType;
        this.xAxisForm.datasetId = row.datasetId;
        this.xAxisForm.datasetName = row.datasetName;
        this.xAxisForm.attr = row.attr;
        this.xAxisForm.xAxisDatas = row.xAxisDatas;
        this.xAxisForm.index = index;
        this.getSheetCharts();
      },
      deletexAxisData(index){
        var sheetIndex = luckysheet.getSheet().index;
        this.sheetChartxAxisDatas[sheetIndex].splice(index,1);
        this.chartxAxisData = this.sheetChartxAxisDatas[sheetIndex];
        var obj = {
          value:index
        }
        luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'deletexAxis'});
        this.saveTplCache();
        this.closeBlockDialog()
      },
      //是否已经添加过该chart了 -1未添加 其他值已添加并且是index
      isAddChart(chartId){
        if(!this.chartxAxisData || this.chartxAxisData.length == 0)
        {
          return -1;
        }else{
          for (let index = 0; index < this.chartxAxisData.length; index++) {
            const element = this.chartxAxisData[index];
            if(chartId == element.chartId)
            {
              return index;
            }
          }
        }
        return -1;
      },
      //获取下钻报表模板
      getDrillReport(query){
        var param = {
          tplName:query,
          currentPage:1,
          pageSize:40
        }
        var obj = {
          url:this.apis.reportTpl.getAllTplsApi,
          params:param,
        }
        var that = this;
        this.commonUtil.getTableList(obj).then(response=>{
          that.reportTpls = response.responseData
        });
      },
      luckysheetDeleteCell(type, str, edr, stc, edc, sheetIndex,isWebsocket){
        this.cellDelete(type, str, edr, stc, edc, sheetIndex,isWebsocket);
      },
      cellDelete(type, str, edr, stc, edc, sheetIndex,isWebsocket)
      {
        const map = this.extraCustomCellConfigs[sheetIndex]
        if (Object.keys(map).length > 0) {
          for(var key in map){
            const value = map[key];
            var r = parseInt(key.split('_')[0])
            var c = parseInt(key.split('_')[1])
            var dataFrom = value.dataFrom;
            if(type == "moveLeft")
            {
              if(dataFrom == 3){
                let groupSummaryDependencyr = Number(value.groupSummaryDependencyr) - 1;
                if(groupSummaryDependencyr != null){
                  if(groupSummaryDependencyr >= str && groupSummaryDependencyr <= edr){
                    let groupSummaryDependencyc = value.groupSummaryDependencyc;
                    if(groupSummaryDependencyc)
                    {
                      var c1 = this.commonUtil.getcFromColumnName(groupSummaryDependencyc);
                      if(c1 > edc)
                      {
                        value.groupSummaryDependencyc = this.commonUtil.getColumnNameFromC(c1 - (edc-stc+1));
                      }else if(c1 >= stc && c1 <= edc){
                        value.dataFrom = 1;
                        value.groupSummaryDependencyr = "";
                        value.groupSummaryDependencyc = "";
                      }
                    }
                  }
                }
              }
              if(r >= str && r <= edr)
              {
                if(c > edc)
                {
                    delete map[r+"_"+c]
                    var newc = c - (edc-stc+1);
                    map[r+"_"+newc] = value;
                }else if(c >= stc && c <= edc)
                {
                    delete map[r+"_"+c]
                }
              }
            }else if(type == "moveUp")
            {
              if(dataFrom == 3){
                let groupSummaryDependencyc = value.groupSummaryDependencyc;
                if(groupSummaryDependencyc)
                {
                  var c1 = this.commonUtil.getcFromColumnName(groupSummaryDependencyc);
                  let groupSummaryDependencyr = Number(value.groupSummaryDependencyr) - 1;
                  if(groupSummaryDependencyr != null)
                  {
                    if(c1 >= stc && c1 <= edc )
                    {
                      if(groupSummaryDependencyr > edr){
                        value.groupSummaryDependencyr = groupSummaryDependencyr -(edr - str + 1) + 1;
                      }else if(groupSummaryDependencyr >= str && groupSummaryDependencyr <= edr){
                        value.dataFrom = 1;
                        value.groupSummaryDependencyr = "";
                        value.groupSummaryDependencyc = "";
                      }
                    }
                  }
                }
              }
              if(c >= stc && c <= edc )
              {
                if(r > edr)
                {
                    delete map[r+"_"+c]
                    var newr = r -(edr - str + 1)
                    map[newr+"_"+c] = value;
                }else if(r >= str && r <= edr)
                {
                    delete map[r+"_"+c]
                }
              }
            }
          }
        }
        if(!isWebsocket){
          this.saveTplCache();
        }
      },
      chartMoveOrResize(chartId,offsetHeight,offsetWidth){
        var offsetings = {
          offsetHeight:offsetHeight,
          offsetWidth:offsetWidth
        }
        this.chartOffsetings[chartId] = offsetings;
      },
      changeChartListener(e){
          var id = e.currentTarget.id;
          var chartId = id.split("_")[0]+"_"+id.split("_")[1]+"_"+id.split("_")[2]
          var offsetHeight = parseInt(e.currentTarget.offsetHeight);
          var offsetWidth = parseInt(e.currentTarget.offsetWidth);
          var offsetings = {
            offsetHeight:offsetHeight,
            offsetWidth:offsetWidth
          }
          this.chartOffsetings[chartId] = offsetings;
      },
      addCellHiddenConditions(){
        this.cellHiddenConditionVisiable = true;
      },
      closeCellHiddenConditionDialog(){
        this.$refs['hiddenConditionRef'].resetFields();
        this.commonUtil.clearObj(this.cellHiddenConditionForm);
        this.cellHiddenConditionForm.index = null;
        this.cellHiddenConditionVisiable = false;
      },
      // 确认单元格隐藏
      confirmAddCellHiddenCondition() {
        var that = this;
        this.$refs['hiddenConditionRef'].validate((valid) => {
          if (valid) {
            if(that.cellHiddenConditionForm.index != null)
            {//修改属性
              that.cellForm.cellHiddenConditions[that.cellHiddenConditionForm.index].propertyName = that.cellHiddenConditionForm.propertyName;
              that.cellForm.cellHiddenConditions[that.cellHiddenConditionForm.index].property = that.cellHiddenConditionForm.property;
              that.cellForm.cellHiddenConditions[that.cellHiddenConditionForm.index].operator = that.cellHiddenConditionForm.operator;
              that.cellForm.cellHiddenConditions[that.cellHiddenConditionForm.index].type = that.cellHiddenConditionForm.type;
              that.cellForm.cellHiddenConditions[that.cellHiddenConditionForm.index].value = that.cellHiddenConditionForm.value;
              that.cellForm.cellHiddenConditions[that.cellHiddenConditionForm.index].dateFormat = that.cellHiddenConditionForm.dateFormat;
            }else{
              var data = {
                propertyName: that.cellHiddenConditionForm.propertyName,
                property: that.cellHiddenConditionForm.property,
                operator: that.cellHiddenConditionForm.operator,
                type: that.cellHiddenConditionForm.type,
                value: that.cellHiddenConditionForm.value,
                dateFormat: that.cellHiddenConditionForm.dateFormat
              }
              if(!that.cellForm.cellHiddenConditions)
              {
                that.cellForm.cellHiddenConditions = [];
              }
              that.cellForm.cellHiddenConditions.push(data);
            }
            that.changeCellAttr("cellHiddenConditions");
            that.closeCellHiddenConditionDialog();
          } else {
            return false
          }
        })
      },
      deleteCellHiddenCondition(index){
        this.cellForm.cellHiddenConditions.splice(index, 1)
        this.changeCellAttr("cellHiddenConditions");
      },
      editCellHiddenCondition(index){
        let cellHiddenCondition = this.cellForm.cellHiddenConditions[index];
        this.cellHiddenConditionForm.propertyName = cellHiddenCondition.propertyName;
        this.cellHiddenConditionForm.property = cellHiddenCondition.property;
        this.cellHiddenConditionForm.operator = cellHiddenCondition.operator;
        this.cellHiddenConditionForm.type = cellHiddenCondition.type;
        this.cellHiddenConditionForm.value = cellHiddenCondition.value;
        this.cellHiddenConditionForm.dateFormat = cellHiddenCondition.dateFormat;
        this.cellHiddenConditionForm.index = index;
        this.cellHiddenConditionVisiable = true;
      },
      copyCellHiddenCondition(row){
        this.cellHiddenConditionForm.propertyName = row.propertyName;
        this.cellHiddenConditionForm.property = row.property;
        this.cellHiddenConditionForm.operator = row.operator;
        this.cellHiddenConditionForm.type = row.type;
        this.cellHiddenConditionForm.value = row.value;
        this.cellHiddenConditionForm.dateFormat = row.dateFormat;
        this.cellHiddenConditionForm.index = null;
        this.cellHiddenConditionVisiable = true;
      },
      changePageHeaderShow(){
        if(this.settingFormData.pageHeaderShow == 1)
        {
          this.settingModalForm[3].show = true;
          this.settingModalForm[3].rules.required= true;
          this.settingModalForm[4].show = true;
          this.settingModalForm[4].rules.required= true;
        }else{
          this.settingModalForm[3].show = false;
          this.settingModalForm[3].rules.required= false;
          this.settingModalForm[4].show = false;
          this.settingModalForm[4].rules.required= false;
        }
      },
      changeWaterMarkShow(){
        if(this.settingFormData.waterMarkShow == 1)
        {
          this.settingModalForm[6].show = true;
          this.settingModalForm[6].rules.required= true;
          this.settingModalForm[7].show = true;
          this.settingModalForm[7].rules.required= true;
          this.settingModalForm[8].show = true;
          this.settingModalForm[8].rules.required= false;
          this.settingModalForm[9].show = true;
          this.settingModalForm[9].rules.required= true;
          this.settingModalForm[10].show = true;
          this.settingModalForm[10].rules.required= true;
          this.changeWaterMarkType();
        }else{
          this.settingModalForm[6].show = false;
          this.settingModalForm[6].rules.required= false;
          this.settingModalForm[7].show = false;
          this.settingModalForm[7].rules.required= false;
          this.settingModalForm[8].show = false;
          this.settingModalForm[8].rules.required= false;
          this.settingModalForm[9].show = false;
          this.settingModalForm[9].rules.required= false;
          this.settingModalForm[10].show = false;
          this.settingModalForm[10].rules.required= false;
        }
      },
      changeWaterMarkType(){
        if(this.settingFormData.waterMarkType == 1){
          this.settingModalForm[7].show = true;
          this.settingModalForm[7].rules.required= true;
          this.settingModalForm[8].show = false;
          this.settingModalForm[8].rules.required= false;
          this.settingModalForm[9].show = false;
          this.settingModalForm[9].rules.required= false;
        }else{
          this.settingModalForm[7].show = false;
          this.settingModalForm[7].rules.required= false;
          this.settingModalForm[8].show = true;
          this.settingModalForm[8].rules.required= false;
          this.settingModalForm[9].show = true;
          this.settingModalForm[9].rules.required= true;
        }
      },
      changePageShow(){
        if(this.settingFormData.pageShow == 1){
          this.settingModalForm[12].show = true;
          this.settingModalForm[12].rules.required= true;
        }else{
          this.settingModalForm[12].show = false;
          this.settingModalForm[12].rules.required= false;
        }
      },
      confirmPrintSettings(){
        var that = this;
        this.$refs['settingRef'].$refs['modalFormRef'].validate((valid) => {
          if (valid) {
            var sheetIndex = luckysheet.getSheet().index
            var printSettings = that.sheetPrintSettings[sheetIndex];
            if(!printSettings)
            {
              printSettings = {};
              that.sheetPrintSettings[sheetIndex] = printSettings;
            }
            printSettings.pageType = that.settingFormData.pageType;
            printSettings.pageLayout = that.settingFormData.pageLayout;
            printSettings.pageHeaderShow = that.settingFormData.pageHeaderShow;
            printSettings.pageHeaderContent = that.settingFormData.pageHeaderContent;
            printSettings.pageHeaderPosition = that.settingFormData.pageHeaderPosition;
            printSettings.waterMarkShow = that.settingFormData.waterMarkShow;
            printSettings.waterMarkType = that.settingFormData.waterMarkType;
            printSettings.waterMarkContent = that.settingFormData.waterMarkContent;
            printSettings.waterMarkImg = that.settingFormData.waterMarkImg;
            printSettings.waterMarkOpacity = that.settingFormData.waterMarkOpacity;
            printSettings.pageShow = that.settingFormData.pageShow;
            printSettings.pagePosition = that.settingFormData.pagePosition;
            printSettings.horizontalPage = that.settingFormData.horizontalPage;
            printSettings.horizontalPageColumn = that.settingFormData.horizontalPageColumn;
            if(printSettings.horizontalPage == 1)
            {
              luckysheet.addDivider(printSettings.horizontalPageColumn);
            }else{
              luckysheet.addDivider(null);
            }
            that.closeSettingModal();
            this.$refs['settingRef'].$refs['modalFormRef'].resetFields();
            that.commonUtil.clearObj(that.settingFormData);
            that.settingFormData = { ...that.defaultSettingFormData};
            that.changePageHeaderShow();
            that.changeWaterMarkShow();
            that.changePageShow();
            var obj = {
              value:printSettings
            }
            luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'printSettings'});
            this.saveTplCache();
          }else{
              return false;
          }
        });
      },
      closeSettingModal(){
        this.settingFormData.waterMarkImgs = [];
        this.settingModalConfig.show = false;
      },
      //回调函数
      doPostCallback(){
        this.loading = false;
      },
      fileUpdate(prop,val){
        if(prop == "waterMarkImgs")
        {
          let url = val[0].url;
          this.settingFormData.waterMarkImg = url;
        }
        
      }
      ,
    userChanged(data){
      this.users = data.v
      if(this.users && this.users.length > 15)
      {
          this.headerUsers = this.users.slice(0,15)
      }else{
          this.headerUsers = this.users;
      }
    },
    saveTplCache(){
      let configs = this.getSheetDatas();
      if(configs)
      {
        const reportTplId = this.$route.query.tplId
        var gridKey="designMode-"+reportTplId;
        const sheetIndex = luckysheet.getSheet().index;
        luckysheet.sendServerMsg("reportTplTempCache", gridKey+"-"+sheetIndex,configs,{ "k": "viewReportCache"});
      }
    },
    saveNewSheetCache(sheet){
      let configs = this.getSheetDatas(sheet.sheet);
      if(configs)
      {
        const reportTplId = this.$route.query.tplId
        var gridKey="designMode-"+reportTplId;
        const sheetIndex = sheet.sheet.index;
        luckysheet.sendServerMsg("reportTplNewTempCache", gridKey+"-"+sheetIndex,configs,{ "k": "viewReportCache"});
      }
    },
    saveTplAttrCache(){
      const reportTplId = this.$route.query.tplId
      var gridKey="designMode-"+reportTplId;
      luckysheet.sendServerMsg("reportTplAttrTempCache", gridKey,this.isParamMerge,{ "k": "isParamMerge"});
    },
    getSheetDatas(luckysheetfile){
      if(!luckysheetfile)
      {
        luckysheetfile = luckysheet.getSheet();
      }
      if (!luckysheetfile.isPivotTable) {
        var cellDatas = this.getCellDatas(luckysheetfile)
        var extraCustomCellConfigs = this.getSheetExtraCustomCellConfigs(cellDatas, luckysheetfile.index)
        var configs = this.getSheetConfigs(luckysheetfile)
        configs.luckysheetAlternateformatSave = luckysheetfile.luckysheet_alternateformat_save;
        var emptyMergeCell = this.getEmptyMergeCell(configs.config.merge, cellDatas)
        cellDatas = cellDatas.concat(emptyMergeCell)
        var borderCellDatas = this.getEmptyBorderCellDatas(configs.config, cellDatas)
        cellDatas = cellDatas.concat(borderCellDatas)
        var dataVerificationCells = this.getEmptyDataVerificationCells(configs.dataVerification, cellDatas);
        cellDatas = cellDatas.concat(dataVerificationCells)
        if (cellDatas && cellDatas.length > 0) {
          var sheetCellFormats = this.cellFormats[luckysheetfile.index]
          if (sheetCellFormats) {
            for (let index = 0; index < cellDatas.length; index++) {
              const element = cellDatas[index]
              var ct = sheetCellFormats[element.r + '_' + element.c]
              if (ct && ct.t && ct.t == "inlineStr") {

              }else{
                if (ct) {
                  element.v.ct = ct
                }
              }
            }
          }
        }
        configs.cellDatas = cellDatas
        configs.blockData = this.blockData[luckysheetfile.index]
        configs.extraCustomCellConfigs = extraCustomCellConfigs
        var chartCells = this.getChartCells(luckysheetfile);
        var checkResult = this.checkChartFirstCellIsUsed(chartCells,cellDatas)
        if(checkResult)
        {
          this.loading = false;
          this.commonUtil.showMessage({message:"图表左上角对应的单元格已被使用，请重新设置图表的位置。",type: "error"})
          return;
        }
        var chartXaxisData = this.sheetChartxAxisDatas[luckysheetfile.index]
        var xxbtScreenShot = this.getXxbtScreenShot(luckysheetfile);
        configs.chartXaxisData = chartXaxisData;
        configs.chartCells = chartCells;
        configs.xxbtScreenShot = xxbtScreenShot;
        var printSettings = this.sheetPrintSettings[luckysheetfile.index];
        if(printSettings)
        {
          configs.reportSheetPdfPrintSetting = printSettings;
        }
        return configs;
      }
    },
    changeReportAttr(data){
      let k = data.k;
      let sheetIndex = data.i;
      const currentIndex = luckysheet.getSheet().index;
      let v = data.v;
      let cells = v.cells
      let value = v.value;
      if("isParamMerge" == k)
      {//参数合并
        this.isParamMerge = value;
      } else if("addBlock" == k)
      {//添加循环块
        if (!this.blockData[sheetIndex]) {
          this.blockData[sheetIndex] = []
        }
        this.blockData[sheetIndex].push(value)
        if(currentIndex == sheetIndex)
        {
          this.sheetBlockData = this.blockData[sheetIndex]
        }
      }else if("editBlock" == k)
      {//编辑循环块
        let index = value.index;
        delete value['index']
        this.blockData[sheetIndex][index] = value;
        // this.$set(this.blockData[sheetIndex],index,value);
        if(currentIndex == sheetIndex)
        {
          this.sheetBlockData = this.blockData[sheetIndex]
        }
      }else if("deleteBlock" == k){
        this.blockData[sheetIndex].splice(value, 1)
        if(currentIndex == sheetIndex)
        {
          this.sheetBlockData = this.blockData[sheetIndex]
        }
      }else if("addXaxis" == k){
        this.getSheetCharts();
        //添加x轴坐标
        if (!this.sheetChartxAxisDatas[sheetIndex]) {
          this.sheetChartxAxisDatas[sheetIndex] = []
        }
        this.sheetChartxAxisDatas[sheetIndex].push(value)
        if(currentIndex == sheetIndex)
        {
          this.chartxAxisData = this.sheetChartxAxisDatas[sheetIndex]
        }
      }else if("editXaxis" == k){
        this.getSheetCharts();
        //修改x轴坐标
        let index = value.index;
        delete value['index']
        this.sheetChartxAxisDatas[sheetIndex][index] = value;
        // this.$set(this.sheetChartxAxisDatas[sheetIndex],index,value);
        if(currentIndex == sheetIndex)
        {
          this.chartxAxisData = this.sheetChartxAxisDatas[sheetIndex]
        }
      }else if("deletexAxis" == k){
        //删除x轴数据
        this.sheetChartxAxisDatas[sheetIndex].splice(value, 1)
        if(currentIndex == sheetIndex)
        {
          this.chartxAxisData = this.sheetChartxAxisDatas[sheetIndex]
        }
      }else if("printSettings" == k){
        //打印设置
        var printSettings = this.sheetPrintSettings[sheetIndex];
        if(!printSettings)
        {
          printSettings = {};
          this.sheetPrintSettings[sheetIndex] = printSettings;
        }
        printSettings.pageType = value.pageType;
        printSettings.pageLayout = value.pageLayout;
        printSettings.pageHeaderShow = value.pageHeaderShow;
        printSettings.pageHeaderContent = value.pageHeaderContent;
        printSettings.pageHeaderPosition = value.pageHeaderPosition;
        printSettings.waterMarkShow = value.waterMarkShow;
        printSettings.waterMarkType = value.waterMarkType;
        printSettings.waterMarkContent = value.waterMarkContent;
        printSettings.waterMarkImg = value.waterMarkImg;
        printSettings.waterMarkOpacity = value.waterMarkOpacity;
        printSettings.pageShow = value.pageShow;
        printSettings.pagePosition = value.pagePosition;
        printSettings.horizontalPage = value.horizontalPage;
        printSettings.horizontalPageColumn = value.horizontalPageColumn;
        if(currentIndex == sheetIndex && this.settingModalConfig.show){
          this.settingFormData.pageType = value.pageType;
          this.settingFormData.pageLayout = value.pageLayout;
          this.settingFormData.pageHeaderShow = value.pageHeaderShow;
          this.settingFormData.pageHeaderContent = value.pageHeaderContent;
          this.settingFormData.pageHeaderPosition = value.pageHeaderPosition;
          this.settingFormData.waterMarkShow = value.waterMarkShow;
          this.settingFormData.waterMarkType = value.waterMarkType;
          this.settingFormData.waterMarkContent = value.waterMarkContent;
          this.settingFormData.waterMarkImg = value.waterMarkImg;
          this.settingFormData.waterMarkOpacity = value.waterMarkOpacity;
          this.settingFormData.pageShow = value.pageShow;
          this.settingFormData.pagePosition = value.pagePosition;
          this.settingFormData.horizontalPage = value.horizontalPage;
          this.settingFormData.horizontalPageColumn = value.horizontalPageColumn;
          this.changePageHeaderShow();
          this.changeWaterMarkShow();
          this.changePageShow();
          this.changeHorizontalPage();
        }
      }else if("datasetChanged" == k){
        this.getDataSets();
        this.commonUtil.showMessage({ message: '报表数据集更新，数据集名称：'+v.datasetName+"，操作人："+data.userName, type: this.commonConstants.messageType.warning })
      }
      else if("sheetNotExist" == k){
        this.commonUtil.showMessage({ message: '该sheet页已经被删除，请尝试刷新页面获取最新的模板数据', type: this.commonConstants.messageType.warning })
      }else if("deleteDataSet" == k){
        if(this.datasets && this.datasets.length > 0)
        {
          for (let index = 0; index < this.datasets.length; index++) {
            const element = this.datasets[index];
            if(element.id == value.id)
            {
              this.commonUtil.showMessage({ message: '报表数据集【'+element.datasetName+"】被删除，操作人："+value.userName, type: this.commonConstants.messageType.warning })
              this.datasets.splice(index, 1)
              break;
            }
          }
        }
      }else if("refreshAuth" == k){
        //更新权限
        if(!this.isCreator){
          this.getTplAuth();
        }
      }
      else{
        if(cells && cells.length > 0){
          var selectedRanges = luckysheet.getRange();
          var currentr = selectedRanges[0].row[0]
          var currentc = selectedRanges[0].column[0]
          for (let index = 0; index < cells.length; index++) {
            const r = cells[index][0];
            const c = cells[index][1];
            var obj = this.getExtraCustomCellConfigs(r, c,sheetIndex)
            if(obj){
              obj[k] = value
              if(k == "cellExtend"){
                if (obj.cellExtend == 4) {
                  obj.dataFrom = 3
                }
              }
            }else{
              obj = {}
              obj[k] = value
              if(k == "cellExtend"){
                if (obj.cellExtend == 4) {
                  obj.dataFrom = 3
                }
              }
            }
            if(sheetIndex == currentIndex)
            {
              if(currentr == r && currentc == c)
              {
                this.cellForm[k] = value
                if(k == "cellExtend"){
                  if (value == 4) {
                    this.cellForm.dataFrom = 3
                  }
                }else if(k == "datasourceId")
                {
                  this.getDatasourceAttr();
                }else if(k == "isDrill")
                {
                    if(value)
                    {
                      this.getDrillReport();
                    }
                }
              }
            }
          }
        }
      }
    },
    changeParamMerge(){
        var obj = {
          value:this.isParamMerge
        }
        const sheetIndex = luckysheet.getSheet().index;
        luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": 'isParamMerge'});
        this.saveTplAttrCache();
    },
    deleteSheet(index){
      const reportTplId = this.$route.query.tplId
      var gridKey="designMode-"+reportTplId+"-"+index;
      luckysheet.sendServerMsg("deleteSheet", gridKey,null,{ "k": 'deleteSheet'});
    },
    frozenCancelAfter(){
      let configs = this.getSheetDatas();
      if(configs)
      {
        const reportTplId = this.$route.query.tplId
        var gridKey="designMode-"+reportTplId;
        const sheetIndex = luckysheet.getSheet().index;
        luckysheet.sendServerMsg("frozenCancleTempCache", gridKey+"-"+sheetIndex,configs,{ "k": "viewReportCache"});
      }
    },
    deleteDataSetCallback(result){
      this.getDataSets();
      var obj = {
        cells:{},
        value:result.responseData
      }
      const sheetIndex = luckysheet.getSheet().index;
      luckysheet.sendServerMsg("reportDesign", sheetIndex,obj,{ "k": "deleteDataSet"});
    }
    ,
    addSubTotalCells(){
      this.cellSubTotalVisiable = true;
    },
    closeSubtotalDialog(){
      this.$refs['subtotalRef'].resetFields()// 校验重置
      this.commonUtil.clearObj(this.cellSubTotalForm)
      this.cellSubTotalVisiable = false;
    },
    confirmAddSubtotal(){
        var that = this;
        this.$refs['subtotalRef'].validate((valid) => {
          if (valid) {
            if(that.cellSubTotalForm.index != null){
              that.cellForm.subTotalCells[that.cellSubTotalForm.index].coords = that.cellSubTotalForm.coords;
              that.cellForm.subTotalCells[that.cellSubTotalForm.index].type = that.cellSubTotalForm.type;
            }else{
              var data = {
                coords: that.cellSubTotalForm.coords,
                type: that.cellSubTotalForm.type,
              }
              if(!that.cellForm.subTotalCells)
              {
                that.cellForm.subTotalCells = [];
              }
              that.cellForm.subTotalCells.push(data);
            }
            this.changeCellAttr("subTotalCells");
            that.closeSubtotalDialog();
          } else {
            return false
          }
        })
      },
      editSubtotalCell(o,index){
        this.cellSubTotalForm.index = index;
        this.cellSubTotalForm.coords = o.coords;
        this.cellSubTotalForm.type = o.type;
        this.cellSubTotalVisiable = true;
      },
      deleteSubtotalCell(index){
        this.cellForm.subTotalCells.splice(index, 1)
        this.changeCellAttr("subTotalCells");
      },
      addSubTotalCalc(){
        this.subTotalCalcVisiable = true;
        this.dataSetAttrs = [];
        let range = luckysheet.getRange();
        if (range.length > 0) {
          let r = range[0].row[0];
          let c = range[0].column[0];
          let v = luckysheet.getCellValue(r,c);
          if(v)
          {
             let datasetName = v.split(".")[0];
             if(this.datasets && this.datasets.length > 0)
             {
                for (let index = 0; index < this.datasets.length; index++) {
                  let element = this.datasets[index];
                  if(datasetName == element.datasetName)
                  {
                    if(element.columns && element.columns.length > 0)
                    {
                      this.dataSetAttrs = element.columns
                    }else{
                      this.getDatasetColumns(element);
                    }
                    break;
                  }
                }
             }
          }
        }
      },
      confirmAddSubtotalCalc(){
        var that = this;
        this.$refs['subtotalCalcRef'].validate((valid) => {
          if (valid) {
            if(that.subTotalCalcForm.index != null){
              that.cellForm.subTotalCalc[that.subTotalCalcForm.index].attrs = that.subTotalCalcForm.attrs;
            }else{
              var data = {
                attrs: that.subTotalCalcForm.attrs,
              }
              if(!that.cellForm.subTotalCalc)
              {
                that.cellForm.subTotalCalc = [];
              }
              that.cellForm.subTotalCalc.push(data);
            }
            this.changeCellAttr("subTotalCalc");
            that.closeSubtotalCalcDialog();
          } else {
            return false
          }
        })
      },
      closeSubtotalCalcDialog(){
        this.$refs['subtotalCalcRef'].resetFields()// 校验重置
        this.commonUtil.clearObj(this.subTotalCalcForm)
        this.subTotalCalcVisiable = false;
      },
      editSubtotalCalc(o,index){
        this.subTotalCalcForm.index = index;
        this.subTotalCalcForm.attrs = o.attrs;
        this.subTotalCalcVisiable = true;
      },
      deleteSubtotalCalc(index){
        this.cellForm.subTotalCalc.splice(index, 1)
        this.changeCellAttr("subTotalCalc");
      },
      addSubTotalAttrs(){
        this.subTotalAttrsVisiable = true;
      },
      confirmAddSubtotalAttrs(){
        var that = this;
        this.$refs['subtotalAttrsRef'].validate((valid) => {
          if (valid) {
            if(that.subTotalAttrsForm.index != null){
              that.cellForm.subTotalAttrs[that.subTotalAttrsForm.index].name = that.subTotalAttrsForm.name;
              that.cellForm.subTotalAttrs[that.subTotalAttrsForm.index].fontColor = that.subTotalAttrsForm.fontColor;
              that.cellForm.subTotalAttrs[that.subTotalAttrsForm.index].fontSize = that.subTotalAttrsForm.fontSize;
              that.cellForm.subTotalAttrs[that.subTotalAttrsForm.index].bgColor = that.subTotalAttrsForm.bgColor;
              that.cellForm.subTotalAttrs[that.subTotalAttrsForm.index].fontWeight = that.subTotalAttrsForm.fontWeight;
            }else{
              var data = {
                name: that.subTotalAttrsForm.name,
                fontColor: that.subTotalAttrsForm.fontColor,
                fontSize: that.subTotalAttrsForm.fontSize,
                bgColor: that.subTotalAttrsForm.bgColor,
                fontWeight: that.subTotalAttrsForm.fontWeight,
              }
              if(!that.cellForm.subTotalAttrs)
              {
                that.cellForm.subTotalAttrs = [];
              }
              that.cellForm.subTotalAttrs.push(data);
            }
            this.changeCellAttr("subTotalAttrs");
            that.closeSubtotalAttrDialog();
          } else {
            return false
          }
        })
      },
      closeSubtotalAttrDialog(){
        this.$refs['subtotalAttrsRef'].resetFields()
        this.commonUtil.clearObj(this.subTotalAttrsForm)
        this.subTotalAttrsForm.index = null;
        this.subTotalAttrsVisiable = false;
      },
      editSubtotalAttrs(o,index){
        this.subTotalAttrsForm.index = index;
        this.subTotalAttrsForm.name = o.name;
        this.subTotalAttrsForm.fontColor = o.fontColor;
        this.subTotalAttrsForm.fontSize = o.fontSize;
        this.subTotalAttrsForm.bgColor = o.bgColor;
        this.subTotalAttrsForm.fontWeight = o.fontWeight;
        this.subTotalAttrsVisiable = true;
      },
      deleteSubtotalAttrs(index){
        this.cellForm.subTotalAttrs.splice(index, 1)
        this.changeCellAttr("subTotalAttrs");
      },
      changeHorizontalPage(){
        if(this.settingFormData.horizontalPage == 1){
          this.settingModalForm[14].show = true;
          this.settingModalForm[14].rules.required= true;
        }else{
          this.settingModalForm[14].show = false;
          this.settingModalForm[14].rules.required= false;
        }
      },
      addAuthClick(){
        let rangeAxis = luckysheet.getRangeAxis();
        if(!rangeAxis || rangeAxis.length == 0)
        {
          this.commonUtil.showMessage({ message: '请先选择要设置的区域。', type: this.commonConstants.messageType.error })
          return;
        }else if(rangeAxis.length > 1)
        {
          this.commonUtil.showMessage({ message: '不能对多个选区执行此操作，请选择单个区域进行操作。', type: this.commonConstants.messageType.error })
          return;
        }
        if(!this.isCreator)
        {
          this.commonUtil.showMessage({ message: '您没有权限进行此操作，只有创建者【'+this.creatorName+'】才有权限进行操作。', type: this.commonConstants.messageType.error })
          return;
        }
        this.rangeAxis = rangeAxis[0];
        const sheetIndex = luckysheet.getSheet().index;
        if(!this.sheetRangeAuth[sheetIndex]){
          this.sheetRangeAuth[sheetIndex] = {};
        }
        let rangeAuth = this.sheetRangeAuth[sheetIndex];
        if(rangeAuth[this.rangeAxis])
        {
          this.commonUtil.showMessage({ message: '该选区已经设置权限，请勿重复设置。', type: this.commonConstants.messageType.error })
          return;
        }
        this.range = luckysheet.getRange()[0];
        this.authTitle = "为选区【"+rangeAxis[0]+"】添加保护权限";
        this.addAuthVisiable = true;
      },
      closeAddAuth(){
        this.addAuthVisiable = false;
        this.addAuthForm.userIds = [];
        this.rangeAxis = null;
        this.range = null;
      },
      confirmAddAuth(){
        if(this.addAuthForm.userIds && this.addAuthForm.userIds.length > 0)
        {
          const sheetIndex = luckysheet.getSheet().index;
          if(!this.sheetRangeAuth[sheetIndex]){
            this.sheetRangeAuth[sheetIndex] = {};
          }
          let rangeAuth = this.sheetRangeAuth[sheetIndex];
          rangeAuth[this.rangeAxis] = {
            rangeAxis:this.rangeAxis,
            range:this.range,
            sheetIndex:sheetIndex,
            userIds:Object.assign([], this.addAuthForm.userIds)
          }
          this.authRangeToArray();
          this.closeAddAuth();
        }else{
          this.commonUtil.showMessage({ message: '请添加授权用户。', type: this.commonConstants.messageType.error })
        }
      },
      viewAuthClick(){
        this.authRangeToArray();
        if(this.isCreator)
        {
          this.authedRangeTitle = "保护范围";
        }else{
          this.authedRangeTitle = "可操作范围";
        }
        this.authdialogVisible = true;
      },
      authRangeToArray(){
        const sheetIndex = luckysheet.getSheet().index;
        this.authedRange = [];
        if(this.sheetRangeAuth)
        {
          if(this.sheetRangeAuth[sheetIndex]){
            for(var key in this.sheetRangeAuth[sheetIndex]) {
              this.authedRange.push(this.sheetRangeAuth[sheetIndex][key])
            }
          }
        }
      },
      getUsers(){
        const obj = {
          url: this.apis.sysUser.getUsersApi,
          params: {},
          removeEmpty: false
        }
        this.commonUtil.doPost(obj).then(response => {
          if (response.code == '200') {
            this.authUsers = response.responseData
          }
        })
      },
      checkUserEditAuth(r,c){
        let result = false;
        if(this.isCreator)
        {
          return true;
        }else{
          const sheetIndex = luckysheet.getSheet().index;
          if(!this.sheetRangeAuth[sheetIndex]){
            return false;
          }else{
            let rangeAuth = this.sheetRangeAuth[sheetIndex];
            for(var key in rangeAuth) {
              let range = rangeAuth[key].range;
              let row = range.row;
              let column = range.column;
              let str = row[0]; let edr = row[1];
              let stc = column[0]; let edc = column[1];
              if(r >= str && r <= edr && c >= stc && c <= edc)
              {
                return true;
              }
            }
          }
          return result;
        }
      },
      cellEditBefore(range){
        let row = range[0].row;
        let column = range[0].column;
        let checkResult = this.checkUserEditAuth(row[0],column[0]);
        if(!checkResult)
        {
          this.commonUtil.showMessage({ message: '暂无编辑权限，如需编辑可联系创建者【'+this.creatorName+"】。", type: this.commonConstants.messageType.error })
          return false;
        }
      },
      copyPasteBefore(range,copyRange){
        if(this.isCreator)
        {
          return true;
        }else{
          let r = range[0].row[0]
          let c = range[0].column[0]
          let copyRowColSpan = this.getCopyRangeRowColSpan(copyRange.copyRange);
          let checkResult = this.checkPasteRange(r,c,copyRowColSpan[0],copyRowColSpan[1]);
          if(!checkResult)
          {
            this.commonUtil.showMessage({ message: '粘贴部分包含暂无编辑权限的单元格，如需编辑可联系创建者【'+this.creatorName+"】。", type: this.commonConstants.messageType.error })
            return false;
          }
          return checkResult;
        }
      },
      checkPasteRange(r,c,rowspan,colspan){
          const sheetIndex = luckysheet.getSheet().index;
          if(!this.sheetRangeAuth[sheetIndex]){
            return false;
          }else{
            let rangeAuth = this.sheetRangeAuth[sheetIndex];
            let authedCells = this.getAuthedCells(rangeAuth);
            let pastRangeCells = this.getRangeCells(r,c,rowspan,colspan);
            if(authedCells == null ||  Object.keys(authedCells).length === 0){
              return false;
            }else{
              for(var key in pastRangeCells) {
                if(!(key in authedCells)){
                  return false;
                }
              }
            }
            return true;
          }
      },
      //获取所有已授权的单元格
      getAuthedCells(rangeAuth){
        const sheetIndex = luckysheet.getSheet().index;
        let cells = this.sheetAuthedCells[sheetIndex];
        if(cells == null)
        {
          cells = {};
          for(var key in rangeAuth) {
            let range = rangeAuth[key].range;
            let row = range.row;
            let column = range.column;
            let str = row[0]; let edr = row[1];
            let stc = column[0]; let edc = column[1];
            for (let i = str; i <= edr; i++) {
              for (let t = stc; t <= edc; t++) {
                cells[i+"_"+t] = "1";
              }
            }
          }
          this.sheetAuthedCells[sheetIndex] = cells;
        }
        return cells;
      },
      getRangeCells(r,c,rowspan,colspan){
        let cells = {};
        for (let i = 0; i <rowspan; i++) {
          for (let t = 0; t < colspan; t++) {
            cells[(r+i)+"_"+(c+t)] = "1";
          }
        }
        return cells;
      },
      getCopyRangeRowColSpan(copyRange){
        let rowSpan = 0;
        let colSpan = 0;
        if(copyRange.length > 1)
        {
          let isSameRow = true;
          let str_r = copyRange[0].row[0];
          let end_r = copyRange[0].row[1];
          for(let s = 1; s < copyRange.length; s++){
            if(copyRange[s].row[0] != str_r || copyRange[s].row[1] != end_r){
              isSameRow = false;
              break;
            }
          }
          if(isSameRow){
            rowSpan = copyRange[0].row[1] - copyRange[0].row[0] + 1;
          }else{
            colSpan = copyRange[0].column[1] - copyRange[0].column[0] + 1;
          }
          for (let index = 0; index < copyRange.length; index++) {
            const element = copyRange[index];
            let row = element.row;
            let column = element.column;
            let rs = row[1]-row[0]+1;
            let cs = column[1] - column[0] + 1;
            if(isSameRow){
              colSpan = colSpan + cs;
            }else{
              rowSpan = rowSpan + rs;
            }
          }
        }else{
          let row = copyRange[0].row;
          let column = copyRange[0].column;
          rowSpan = row[1]-row[0]+1;
          colSpan = column[1] - column[0] + 1;
        }
        let result = [rowSpan,colSpan]
        return result;
      },
      pasteHandlerBefore(range,data){
        if(this.isCreator)
        {
          return true;
        }else{
          let r = range[0].row[0]
          let c = range[0].column[0]
          let rs = data.length
          let cs = data[0].length
          let checkResult = this.checkPasteRange(r,c,rs,cs);
          if(!checkResult)
          {
            this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("error.auth.operate",[this.creatorName]), type: this.commonConstants.messageType.error })
            return false;
          }
          return checkResult;
        }
      },
      rangeAuthCheck(range){
        if(this.isCreator){
          return true;
        }else{
          let checkResult = this.checkRangeAuth(range);
          if(!checkResult)
          {
            this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("error.auth.operate",[this.creatorName]), type: this.commonConstants.messageType.error })
          }
          return checkResult;
        }
      },
      formulaAuthCheck(range){
        if(this.isCreator){
          return true;
        }else{
          let checkResult = this.checkRangeAuth(range);
          if(!checkResult)
          {
            this.commonUtil.showMessage({ message: '公式计算结果不在可操作范围内，如需编辑可联系创建者【'+this.creatorName+"】。", type: this.commonConstants.messageType.error })
          }
          return checkResult;
        }
      },
      checkRangeAuth(range){
          if(this.isCreator)
          {
           return true;
          }
          const sheetIndex = luckysheet.getSheet().index;
          let rangeAuth = this.sheetRangeAuth[sheetIndex];
          let authedCells = this.getAuthedCells(rangeAuth);
          let rangeCells = {};
          for (let index = 0; index < range.length; index++) {
            const element = range[index];
            let r = element.row[0];
            let c = element.column[0];
            let rs = element.row[1] - element.row[0] + 1;
            let cs = element.column[1] - element.column[0] + 1;
            let cells = this.getRangeCells(r,c,rs,cs);
            rangeCells = {...rangeCells,...cells}
          }
          if(authedCells == null ||  Object.keys(authedCells).length === 0){
            return false;
          }else{
            for(var key in rangeCells) {
              if(!(key in authedCells)){
                return false;
              }
            }
            return true;
          }
      },
      editRange(range){
        this.rangeAxis = range.rangeAxis;
        this.range = range.range
        this.authTitle = "修改选区【"+range.rangeAxis+"】权限";
        this.addAuthForm.userIds = range.userIds;
        this.addAuthVisiable = true;
      },
      deleteRange(range,index){
        this.authedRange.splice(index, 1);
        const sheetIndex = luckysheet.getSheet().index;
        if(this.sheetRangeAuth){
          if(this.sheetRangeAuth[sheetIndex]){
            delete this.sheetRangeAuth[sheetIndex][range.rangeAxis]
          }
        }
      },
      showRange(range){
        luckysheet.addAuthRange([range.range])
      },
      closeAuthDialog(){
        this.authdialogVisible = false;
        this.authedRange = [];
        if(this.isCreator)
        {
          luckysheet.addAuthRange(null)
        }
      },
      //获取使用者授权范围
      getTplAuth(){
        const sheetIndex = luckysheet.getSheet().index;
        const reportTplId = this.$route.query.tplId// reportTplId
        const obj = {
          url: this.apis.reportTpl.getTplAuthApi,
          params: { id: reportTplId },
          removeEmpty: false
        }
        this.sheetAuthedCells = {};
        this.authedRange = [];
        // luckysheet.addAuthRange();
        var that = this;
        this.commonUtil.doPost(obj).then(response => {
          if (response.code == '200') {
            that.sheetRangeAuth = response.responseData
            that.authRangeToArray();
            that.showSheetAuthedRanges(sheetIndex);
          }
        })
      },
      showSheetAuthedRanges(sheetIndex){
        if(this.sheetRangeAuth)
        {
          if(this.sheetRangeAuth[sheetIndex])
          {
            let range = [];
            for(var key in this.sheetRangeAuth[sheetIndex]) {
              range.push(this.sheetRangeAuth[sheetIndex][key].range)
            }
            luckysheet.addAuthRange(range);
          }else{
            luckysheet.addAuthRange(null);
          }
        }else{
          luckysheet.addAuthRange(null);
        }
      },
      sheetActivateAfter(index){
        this.addAuthVisiable = false;
        this.authdialogVisible = false;
        if(!this.isCreator)
        {
          this.showSheetAuthedRanges(index);
        }else{
          luckysheet.addAuthRange(null);
        }
        this.showAuthInfoMsg();
      },
      loadDataAfter(){
        this.showAuthInfoMsg();
      },
      showAuthInfoMsg(){
        if(!this.isCreator)
        {
            const sheetIndex = luckysheet.getSheet().index;
            if(this.sheetRangeAuth)
            {
              if(this.sheetRangeAuth[sheetIndex])
              {
                this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("warning.auth.operate",[this.creatorName]), type: this.commonConstants.messageType.warning })
              }else{
                this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("warning.auth.nooperate",[this.creatorName]), type: this.commonConstants.messageType.warning })
              }
            }else{
              this.commonUtil.showMessage({ message: this.commonUtil.getMessageFromList("warning.auth.nooperate",[this.creatorName]), type: this.commonConstants.messageType.warning })
            }
        }
      },
      pdfsettingClick(){
        var that = this;
        //PDF/打印设置
        that.settingModalConfig.show = true;
        var sheetIndex = luckysheet.getSheet().index
        var printSettings = that.sheetPrintSettings[sheetIndex];
        if(printSettings)
        {
          that.settingFormData.pageType = printSettings.pageType;
          that.settingFormData.pageLayout = printSettings.pageLayout;
          that.settingFormData.pageHeaderShow = printSettings.pageHeaderShow;
          that.settingFormData.pageHeaderContent = printSettings.pageHeaderContent;
          that.settingFormData.pageHeaderPosition = printSettings.pageHeaderPosition;
          that.settingFormData.waterMarkShow = printSettings.waterMarkShow;
          that.settingFormData.waterMarkType = printSettings.waterMarkType;
          that.settingFormData.waterMarkContent = printSettings.waterMarkContent;
          that.settingFormData.waterMarkImg = printSettings.waterMarkImg;
          that.settingFormData.waterMarkOpacity = printSettings.waterMarkOpacity+"";
          that.settingFormData.pageShow = printSettings.pageShow;
          that.settingFormData.pagePosition = printSettings.pagePosition;
          that.settingFormData.horizontalPage = printSettings.horizontalPage;
          that.settingFormData.horizontalPageColumn = printSettings.horizontalPageColumn;
        }else{
          that.settingFormData = { ...that.defaultSettingFormData};
        }
        that.changePageHeaderShow();
        that.changeWaterMarkShow();
        that.changePageShow();
        that.changeHorizontalPage();
      },
      uploadFileClick(type){
        this.uploadType = type;
        $('#uploadBtn').click() // 触发父容器中的保存模板按钮事件
      }
    },
}