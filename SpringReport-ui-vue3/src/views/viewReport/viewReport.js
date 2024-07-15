export default {
    name:'viewReport',
    data() {
      return{
        pageData:{
          defaultProps: {
            children: 'children',
            label: 'label'
          },
          treeData:[],
          //查询表单内容 start
          searchForm:[
            {type:'Input',label:'报表名称',prop:'tplName'},
            // {type:'Select',label:'报表类型',prop:'reportType',props:{label:"reportTypeName",value:"id"}},
          ],
          //查询表单内容 end
          //查询条件 start
          queryData:{
            tplName:"",//模板名称
            reportType:"",//报表类型
          },
          //查询条件 end
          //查询表单按钮start
          searchHandle:[
            {label:'查询',type:'primary',handle:()=>this.searchtablelist(),auth:'viewReport_Search'},
            {label:'重置',type:'warning',handle:()=>this.resetSearch(),auth:'viewReport_Search'}
          ],
          //查询表单按钮end
          //表格数据start
          tableData:[],
          //表格数据end
          //表格工具栏按钮 start
          tableHandles:[
          ],
          //表格工具栏按钮 end
          selectList:[],//表格选中的数据
          //表格分页信息start
          tablePage:{
            currentPage: 1,
            pageSize:10,
            pageTotal: 0,
            pageSizeRange:[5, 10, 20, 50]
          },
          //表格分页信息end
          //表格列表头start
          tableCols:[
            {label:'报表名称',prop:'tplName',align:'center',overflow:true},
            {label:'报表类型',prop:'reportTypeName',align:'center',overflow:true},
            {label:'导出是否加密',prop:'exportEncrypt',align:'center',codeType:'yesNo',formatter:this.commonUtil.getTableCodeName,overflow:true},
            {label:'报表类型',prop:'tplType',align:'center',codeType:'tplType',formatter:this.commonUtil.getTableCodeName,overflow:true},
            {label:'操作',prop:'operation',align:'center',type:'button',fixed:'right',width:200,btnList:[
                {label:'报表查看',type:'primary',auth:'viewReport_view',handle:(row)=>this.routerTo(row.tplType == '1'?'luckyReportPreview':'luckyReportFromsPreview',row)},
            ]}
          ],
          //表格列表头end
        }
      }
    },
    mounted() {
      this.searchtablelist();
      // this.getReportType();
      this.getReportTypeTree();
    },
    methods:{
      /**
       * @description: 获取表格数据
       * @param {type} 
       * @return: 
       * @author: caiyang
       */    
      searchtablelist(){
        var obj = {
          url:this.apis.reportTpl.getRoleReportsApi,
          params:Object.assign({}, this.pageData.queryData, this.pageData.tablePage),
        }
        this.commonUtil.getTableList(obj).then(response=>{
          this.commonUtil.tableAssignment(response,this.pageData.tablePage,this.pageData.tableData);
        });
      },
      resetSearch(){
        var reportType = this.pageData.queryData.reportType;
        this.commonUtil.clearObj(this.pageData.queryData);
        this.pageData.queryData.reportType = reportType;
        this.searchtablelist();
      },
      selectChange(rows){
        this.pageData.selectList = rows;
      },
      //获取报表类型
      getReportType(){
        var obj = {
          params:{},
          url:this.apis.reportType.getReportTypeApi
        }
        this.commonUtil.doPost(obj) .then(response=>{
          if (response.code == "200")
          {
            this.pageData.searchForm[1].options = response.responseData;
            this.$refs['searchRef'].$forceUpdate();
          }
        });
      },
      //页面跳转
      routerTo(name,row){
        let viewReport = this.$router.resolve({ name:name,query: {tplId:row.id}});
        window.open(viewReport.href, '_blank');
      },
      getReportTypeTree(){
        var obj = {
          params:{},
          removeEmpty:false,
          url:this.apis.reportType.getReportTypeTreeApi
        }
        this.commonUtil.doPost(obj) .then(response=>{
          if (response.code == "200")
          {
            this.pageData.treeData = response.responseData
          }
        });
      },
      handleNodeClick(data){
        if(data.id == '1')
        {
          this.pageData.queryData.reportType = "";
        }else{
          this.pageData.queryData.reportType = data.id;
        }
        this.searchtablelist();
      }
    }
  };