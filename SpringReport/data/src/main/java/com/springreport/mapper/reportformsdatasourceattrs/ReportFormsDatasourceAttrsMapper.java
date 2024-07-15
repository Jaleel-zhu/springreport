package com.springreport.mapper.reportformsdatasourceattrs;
import com.springreport.entity.reportformsdatasourceattrs.ReportFormsDatasourceAttrs;
import java.util.List;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

 /**  
* @Description: ReportFormsDatasourceAttrsMapper类
* @author 
* @date 2022-11-16 01:47:58
* @version V1.0  
 */
public interface ReportFormsDatasourceAttrsMapper extends BaseMapper<ReportFormsDatasourceAttrs>{

    /**
     * 通过条件，查询数据集合，返回分页数据，字符串参数模糊查询
     *
     * @param model 包含查询条件的对象实体
     * @return 实体集合
     */
    List<ReportFormsDatasourceAttrs> searchDataLike(final ReportFormsDatasourceAttrs model);
}