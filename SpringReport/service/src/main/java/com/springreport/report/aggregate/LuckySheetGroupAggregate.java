package com.springreport.report.aggregate;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import com.alibaba.fastjson.JSONArray;
import com.springreport.dto.reporttpl.LuckySheetBindData;
import com.springreport.entity.luckysheetreportcell.LuckysheetReportCell;
import com.springreport.enums.AggregateTypeEnum;
import com.springreport.enums.DataFromEnum;
import com.springreport.enums.YesNoEnum;
import com.springreport.report.CellUtil;
import com.springreport.util.ListUtil;
import com.springreport.util.LuckysheetUtil;
import com.springreport.util.StringUtil;

/**  
 * @ClassName: GroupAggregate
 * @Description: 分组聚合处理
 * @author caiyang
 * @date 2021-05-27 04:55:07 
*/  
public class LuckySheetGroupAggregate extends Aggregate<LuckysheetReportCell,LuckySheetBindData,Map<String, LuckySheetBindData>>{

	@Override
	public LuckySheetBindData aggregate(LuckysheetReportCell reportCell,LuckySheetBindData bindData,Map<String, LuckySheetBindData> cellBinddata) {
		String property = reportCell.getCellValue();
		String[] datasetNames = LuckysheetUtil.getDatasetNames(reportCell.getDatasetName());
		if(StringUtil.isNotEmpty(property))
		{
			if(datasetNames.length > 1)
			{
				property = property.replaceAll("\\$", "").replaceAll("\\{", "").replaceAll("}", "");
			}else {
				property = property.replaceAll(datasetNames[0]+".", "").replaceAll("\\$", "").replaceAll("\\{", "").replaceAll("}", "");
			}	
		}
		bindData.setProperty(property);
		List<List<Map<String, Object>>> datas = null;
		List<List<Map<String, Object>>> filterDatas = new ArrayList<List<Map<String,Object>>>();
		JSONArray filters = JSONArray.parseArray(bindData.getCellConditions());
		CellUtil.processCellFilters(filters, bindData, cellBinddata, bindData.getSheetIndex());
		String groupProperty = property;
		if(StringUtil.isNotEmpty(bindData.getGroupProperty()))
		{
			groupProperty = bindData.getGroupProperty();
		}
		List<List<Map<String, Object>>> bindDatas = null;
		if(bindData.getLastIsConditions().intValue() == YesNoEnum.YES.getCode().intValue()) {
			bindDatas = bindData.getFilterDatas();
		}else {
			bindDatas = bindData.getDatas();
		} 
		if(!ListUtil.isEmpty(bindDatas))
		{
			if(AggregateTypeEnum.GROUP.getCode().equals(bindData.getLastAggregateType()) || AggregateTypeEnum.GROUPSUMMARY.getCode().equals(bindData.getLastAggregateType()))
			{//上次数据处理是分组聚合
				//本次数据处理是分组聚合，则数据进行分组处理
				String[] properties = groupProperty.split(",");
				for (int t = 0; t < properties.length; t++) {
					datas = new ArrayList<List<Map<String,Object>>>();
					for (int i = 0; i < bindDatas.size(); i++) {
						Map<String, List<Map<String, Object>>> dataMap = new LinkedHashMap<String, List<Map<String, Object>>>();
						Map<String, List<Map<String, Object>>> filterDataMap = new LinkedHashMap<String, List<Map<String, Object>>>();
						for (int j = 0; j < bindDatas.get(i).size(); j++) {
							Map<String, Object> map = bindDatas.get(i).get(j);
							String value = String.valueOf(map.get(properties[t]));
							List<Map<String, Object>> rowList=null;
							if (dataMap.containsKey(value)) {
								rowList = dataMap.get(value);
							}else {
								rowList = new ArrayList<Map<String,Object>>();
								dataMap.put(value, rowList);
							}
							rowList.add(map);
							if(t == properties.length - 1)
							{
								List<Map<String, Object>> filterRowList=null;
								if(bindData.getIsConditions().intValue() == YesNoEnum.YES.getCode().intValue())
								{
									boolean filterResult = ListUtil.filterDatas(filters, map,bindData.getCellConditionType());
									if(filterResult)
									{
										if(filterDataMap.containsKey(value))
										{
											filterRowList = filterDataMap.get(value);
										}else {
											filterRowList = new ArrayList<Map<String,Object>>();
											filterDataMap.put(value, filterRowList);
										}
										filterRowList.add(map);
									}
								}
							}
						}
						Set<String> keySet = dataMap.keySet();
						if(keySet.size() == 1)
						{
							if(keySet.toArray()[0].equals("null"))
							{
								List<Map<String, Object>> cellData = null;
								Iterator<Entry<String, List<Map<String, Object>>>> entries = dataMap.entrySet().iterator();
								while(entries.hasNext()){
									List<Map<String, Object>> list = entries.next().getValue();
									for (int j = 0; j < list.size(); j++) {
										cellData = new ArrayList<Map<String,Object>>();
										cellData.add(list.get(j));
										datas.add(cellData);
									}
								}
							}else {
								Iterator<Entry<String, List<Map<String, Object>>>> entries = dataMap.entrySet().iterator();
								while(entries.hasNext()){
									datas.add(entries.next().getValue());
								}
							}
						}else {
							Iterator<Entry<String, List<Map<String, Object>>>> entries = dataMap.entrySet().iterator();
							while(entries.hasNext()){
								datas.add(entries.next().getValue());
							}
						}
						if(t == properties.length - 1)
						{
							Set<String> keySet2 = dataMap.keySet();
							if(keySet2.size() == 1)
							{
								if(keySet2.toArray()[0].equals("null"))
								{
									List<Map<String, Object>> cellData = null;
									Iterator<Entry<String, List<Map<String, Object>>>> entries = filterDataMap.entrySet().iterator();
									while(entries.hasNext()){
										List<Map<String, Object>> list = entries.next().getValue();
										for (int j = 0; j < list.size(); j++) {
											cellData = new ArrayList<Map<String,Object>>();
											cellData.add(list.get(j));
											filterDatas.add(cellData);
										}
									}
								}else {
									Iterator<Entry<String, List<Map<String, Object>>>> entries = filterDataMap.entrySet().iterator();
									while(entries.hasNext()){
										filterDatas.add(entries.next().getValue());
									}
								}
							}else {
								Iterator<Entry<String, List<Map<String, Object>>>> entries = filterDataMap.entrySet().iterator();
								while(entries.hasNext()){
									filterDatas.add(entries.next().getValue());
								}
							}
						}
					}
					bindData.setDatas(datas);
					if(bindData.getIsConditions().intValue() == YesNoEnum.NO.getCode().intValue()) {
						filterDatas = datas;
						bindData.setFilterDatas(datas);
					}
					if(bindData.getLastIsConditions().intValue() == YesNoEnum.YES.getCode().intValue()) {
						bindData.setIsConditions(YesNoEnum.YES.getCode());
					}
					if(t == properties.length - 1)
					{
						if(bindData.getIsConditions().intValue() == YesNoEnum.YES.getCode().intValue())
						{
							bindData.setFilterDatas(filterDatas);
						}
					}
				}
				bindData.setLastAggregateType(AggregateTypeEnum.GROUP.getCode());
			}else if(AggregateTypeEnum.LIST.getCode().equals(bindData.getLastAggregateType())){
				//上次数据处理是列表聚合，则不进行分组，直接返回全部数据
				datas = new ArrayList<List<Map<String,Object>>>();
				datas.addAll(bindDatas);
				if(bindData.getIsConditions().intValue() == YesNoEnum.YES.getCode().intValue())
				{
					List<Map<String, Object>> filterCellData = null;
					for (int i = 0; i < bindDatas.size(); i++) {
						filterCellData = new ArrayList<Map<String,Object>>();
						boolean filterResult = ListUtil.filterDatas(filters, bindDatas.get(i).get(0),bindData.getCellConditionType());
						if(filterResult)
						{
							filterCellData.add(bindDatas.get(i).get(0));
							filterDatas.add(filterCellData);
						}
					}
					bindData.setFilterDatas(filterDatas);
				}else {
					bindData.setFilterDatas(datas);
				}
				bindData.setDatas(datas);
				if(bindData.getLastIsConditions().intValue() == YesNoEnum.YES.getCode().intValue()) {
					bindData.setIsConditions(YesNoEnum.YES.getCode());
				}
				bindData.setLastAggregateType(AggregateTypeEnum.LIST.getCode());
			}
		}else {
			datas = new ArrayList<List<Map<String,Object>>>();
			bindData.setDatas(datas);
			bindData.setFilterDatas(datas);
			bindData.setLastAggregateType(AggregateTypeEnum.GROUP.getCode());
		}
		
		return bindData;
	}

}