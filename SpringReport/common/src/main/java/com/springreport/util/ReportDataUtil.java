package com.springreport.util;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.sql.DataSource;

import org.influxdb.dto.QueryResult;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.springreport.base.ReportDataColumnDto;
import com.springreport.base.ReportDataDetailDto;
import com.springreport.constants.StatusCode;
import com.springreport.enums.InParamTypeEnum;
import com.springreport.enums.OutParamTypeEnum;
import com.springreport.enums.ResultTypeEnum;
import com.springreport.exception.BizException;

import lombok.extern.slf4j.Slf4j;

/**  
 * @ClassName: ReportDataUtil
 * @Description: 报表数据工具类
 * @author caiyang
 * @date 2021-11-18 10:38:58 
*/  
@Slf4j
public class ReportDataUtil {

	/**  
	 * @Title: getApiResult
	 * @Description: 处理api返回结果
	 * @param apiResult
	 * @param apiResultType
	 * @param apiPrefix
	 * @return
	 * @author caiyang
	 * @date 2021-11-18 02:05:43 
	 */ 
	public static List<Map<String, Object>> getApiResult(String apiResult,String apiResultType,String apiPrefix)
	{
		List<Map<String, Object>> result = null;
		Object resultObj = null;
		if(ResultTypeEnum.OBJECT.getCode().equals(apiResultType))
		{//返回类型是对象
			JSONObject jsonObject = JSONObject.parseObject(apiResult);
			if(StringUtil.isNotEmpty(apiPrefix) && jsonObject != null)
			{//前缀是否为空
				String[] prefixes = apiPrefix.split("[.]");
				for (int j = 0; j < prefixes.length; j++) {
					Object object = jsonObject.get(prefixes[j]);
					if(object instanceof JSONObject)
					{
						if(j == prefixes.length - 1)
						{
							resultObj = object;
						}else {
							jsonObject = JSONObject.parseObject(JSONObject.toJSONString(object));
						}
					}else if(object instanceof JSONArray)
					{
						if(j == prefixes.length - 1)
						{
							resultObj = object;
						}else {
							throw new BizException(StatusCode.FAILURE, "不支持的返回值格式。");
						}
					}else {
						throw new BizException(StatusCode.FAILURE,"不支持的返回值格式。");
					}
				}
			}else {
				resultObj = JSONObject.parseObject(apiResult);
			}
		}else {//返回类型是对象数组
			JSONArray jsonArray = JSONArray.parseArray(apiResult);
			if(jsonArray.get(0) instanceof JSONObject)
			{
				resultObj = jsonArray;
			}else {
				throw new BizException(StatusCode.FAILURE, "不支持的返回值格式。");
			}
		}
		if(resultObj instanceof JSONObject)
		{
			result = new ArrayList<Map<String,Object>>();
			Map<String, Object> map = JSONObject.parseObject(JSONObject.toJSONString(resultObj), Map.class);
			result.add(map);
		}else if(resultObj instanceof JSONArray){
			JSONArray jsonArray = (JSONArray) resultObj;
			Map<String, Object> map = null;
			result = new ArrayList<Map<String,Object>>();
			for (int i = 0; i < jsonArray.size(); i++) {
				map = JSONObject.parseObject(JSONObject.toJSONString(jsonArray.get(i)), Map.class);
				result.add(map);
			}
		}
		return result;
	}
	
	/**  
	 * @Title: getDatasourceDataBySql
	 * @Description: 根据sql获取数据
	 * @param dataSource
	 * @param sqlText
	 * @return
	 * @author caiyang
	 * @date 2021-11-18 02:05:56 
	 */ 
	public static List<Map<String, Object>> getDatasourceDataBySql(DataSource dataSource, String sqlText) {
		Connection conn = null;
	    Statement stmt = null;
	    ResultSet rs = null;
	    List<Map<String, Object>> result = null;
	    try {
	    	conn = dataSource.getConnection();
	    	stmt = conn.createStatement();
	    	log.error("执行sql："+sqlText);
            rs = stmt.executeQuery(sqlText);
            final ResultSetMetaData rsMataData = rs.getMetaData();
            final int count = rsMataData.getColumnCount();
            result = new ArrayList<>();
            while(rs.next()){
                Map<String, Object> map = new HashMap<String, Object>();
                for(int i = 0; i < count; i++){
                 map.put(rsMataData.getColumnLabel(i+1), rs.getObject(rsMataData.getColumnLabel(i+1)));
                }
                result.add(map);
            }
        } catch (final SQLException ex) {
            throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, stmt, rs);
        }
		return result;
	}
	
	public static List<Map<String, Object>> getDatasourceDataBySql(Connection conn, String sqlText) {
	    Statement stmt = null;
	    ResultSet rs = null;
	    List<Map<String, Object>> result = null;
	    try {
	    	stmt = conn.createStatement();
            rs = stmt.executeQuery(sqlText);
            log.info("执行sql："+sqlText);
            final ResultSetMetaData rsMataData = rs.getMetaData();
            final int count = rsMataData.getColumnCount();
            result = new ArrayList<>();
            while(rs.next()){
                Map<String, Object> map = new HashMap<String, Object>();
                for(int i = 0; i < count; i++){
                 map.put(rsMataData.getColumnLabel(i+1), rs.getObject(rsMataData.getColumnLabel(i+1)));
                }
                result.add(map);
            }
        } catch (final SQLException ex) {
            throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, stmt, rs);
        }
		return result;
	}
	
	public static List<Map<String, Object>> getDatasourceDataBySql(DataSource dataSource, String sqlText,String username,String password) {
		Connection conn = null;
	    Statement stmt = null;
	    ResultSet rs = null;
	    List<Map<String, Object>> result = null;
	    try {
	    	conn = dataSource.getConnection(StringUtil.isNullOrEmpty(username)?"":username,StringUtil.isNullOrEmpty(password)?"":password);
	    	stmt = conn.createStatement();
            rs = stmt.executeQuery(sqlText);
            log.info("执行sql："+sqlText);
            final ResultSetMetaData rsMataData = rs.getMetaData();
            final int count = rsMataData.getColumnCount();
            result = new ArrayList<>();
            while(rs.next()){
                Map<String, Object> map = new HashMap<String, Object>();
                for(int i = 0; i < count; i++){
                 map.put(rsMataData.getColumnLabel(i+1), rs.getObject(rsMataData.getColumnLabel(i+1)));
                }
                result.add(map);
            }
        } catch (final SQLException ex) {
            throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, stmt, rs);
        }
		return result;
	}
	
	/**  
	 * @MethodName: getInfluxdbData
	 * @Description: 获取influxdb数据
	 * @author caiyang
	 * @param connection
	 * @param sqlText
	 * @return 
	 * @return List<Map<String,Object>>
	 * @date 2022-12-06 04:28:27 
	 */  
	public static List<Map<String, Object>> getInfluxdbData(InfluxDBConnection connection,String sqlText)
	{
		List<Map<String, Object>> result = null;
		try {
			QueryResult queryResult = connection.query(sqlText);
			if(queryResult.getResults().get(0).getSeries() != null)
			{
				List<String> columns = queryResult.getResults().get(0).getSeries().get(0).getColumns();
				List<List<Object>> values= queryResult.getResults().get(0).getSeries().get(0).getValues();
				if(!ListUtil.isEmpty(values))
				{
					result = new ArrayList<>();
					for (int i = 0; i < values.size(); i++) {
						List<Object> rowValues = values.get(i);
						Map<String, Object> map = new HashMap<>();
						for (int j = 0; j < rowValues.size(); j++) {
							map.put(columns.get(j), rowValues.get(j));
						}
						result.add(map);
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			connection.close();
		}
		
		return result;
	}
	
	/**  
	 * @Title: getDatasourceDataByProcedure
	 * @Description: 根据存储过程获取数据
	 * @param dataSource
	 * @param sqlText
	 * @param params
	 * @param inParams
	 * @param outParams
	 * @return
	 * @author caiyang
	 * @date 2021-11-18 02:06:49 
	 */ 
	public static List<Map<String, Object>> getDatasourceDataByProcedure(DataSource dataSource, String sqlText,Map<String, Object> params,JSONArray inParams,JSONArray outParams) {
		if(params == null)
		{
			params = new HashMap<String, Object>();
		}
		List<Map<String, Object>> result = null;
		Connection conn = null;
		CallableStatement cstm = null;
	    ResultSet rs = null;
	    int inParamSize = 0;
	    try {
	    	conn = dataSource.getConnection();
	    	if(!sqlText.startsWith("{"))
	    	{
	    		sqlText = "{" + sqlText;
	    	}
	    	if(!sqlText.endsWith("}"))
	    	{
	    		sqlText = sqlText + "}";
	    	}
	    	cstm = conn.prepareCall(sqlText); //实例化对象cstm
	    	result = new ArrayList<>();
	    	if(!ListUtil.isEmpty(inParams))
	    	{
	    		inParamSize = inParams.size();
	    		JSONObject jsonObject = null;
	    		for (int i = 0; i < inParams.size(); i++) {
	    			jsonObject = (JSONObject) inParams.get(i);
	    			String paramCode = jsonObject.getString("paramCode");
	    			Object param = params.get(paramCode);
	    			if(param == null)
	    			{
	    				param = jsonObject.get("paramDefault");
	    			}
	    			if(InParamTypeEnum.INT.getCode().equals(jsonObject.getString("paramType")))
	    			{
	    				cstm.setInt(i+1, Integer.valueOf(String.valueOf(param)));
	    			}else if(InParamTypeEnum.STRING.getCode().equals(jsonObject.getString("paramType")))
    				{
    					cstm.setString(i+1, String.valueOf(param));
    				}else if(InParamTypeEnum.LONG.getCode().equals(jsonObject.getString("paramType")))
    				{
    					cstm.setLong(i+1, Long.valueOf(String.valueOf(param)));
    				}else if(InParamTypeEnum.DOUBLE.getCode().equals(jsonObject.getString("paramType")))
    				{
    					cstm.setDouble(i+1, Double.valueOf(String.valueOf(param)));
    				}else if(InParamTypeEnum.FLOAT.getCode().equals(jsonObject.getString("paramType")))
    				{
    					cstm.setFloat(i+1, Float.valueOf(String.valueOf(param)));
    				}else if(InParamTypeEnum.BIGDECIMAL.getCode().equals(jsonObject.getString("paramType")))
    				{
    					cstm.setBigDecimal(i+1, new BigDecimal(String.valueOf(param)));
    				}if(InParamTypeEnum.DATE.getCode().equals(jsonObject.getString("paramType")))
	    			{
    					cstm.setDate(i+1, DateUtil.string2SqlDate(String.valueOf(param),DateUtil.FORMAT_LONOGRAM));
	    			}
	    		}
	    	}
	    	if(ListUtil.isEmpty(outParams))
	    	{
	            rs = cstm.executeQuery();
	            log.info("执行sql："+sqlText);
	            final ResultSetMetaData rsMataData = rs.getMetaData();
	            final int count = rsMataData.getColumnCount();
	            result = new ArrayList<>();
	            while(rs.next()){
	                Map<String, Object> map = new HashMap<String, Object>();
	                for(int i = 0; i < count; i++){
	                 map.put(rsMataData.getColumnLabel(i+1), rs.getObject(rsMataData.getColumnLabel(i+1)));
	                }
	                result.add(map);
	            }
	    	}else {
	    		JSONObject jsonObject = null;
	    		for (int i = 0; i < outParams.size(); i++) {
	    			jsonObject = (JSONObject) outParams.get(i);
	    			if(OutParamTypeEnum.INTEGER.getCode().equals(jsonObject.getString("paramType")))
	    			{
	    				cstm.registerOutParameter(i+1+inParamSize, Types.INTEGER);
	    			}else if(OutParamTypeEnum.VARCHAR.getCode().equals(jsonObject.getString("paramType")))
		    		{
	    				cstm.registerOutParameter(i+1+inParamSize, Types.VARCHAR);
		    		}else if(OutParamTypeEnum.BIGINT.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			cstm.registerOutParameter(i+1+inParamSize, Types.BIGINT);
		    		}else if(OutParamTypeEnum.FLOAT.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			cstm.registerOutParameter(i+1+inParamSize, Types.FLOAT);
		    		}else if(OutParamTypeEnum.DOUBLE.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			cstm.registerOutParameter(i+1+inParamSize, Types.DOUBLE);
		    		}else if(OutParamTypeEnum.DECIMAL.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			cstm.registerOutParameter(i+1+inParamSize, Types.DECIMAL);
		    		}
	    		}
	    		cstm.executeQuery();
	    		log.info("执行sql："+sqlText);
	    		Map<String, Object> map = new HashMap<String, Object>();
	    		for (int i = 0; i < outParams.size(); i++) {
	    			jsonObject = (JSONObject) outParams.get(i);
	    			String paramCode = jsonObject.getString("paramCode");
	    			int index = i + 1 + inParamSize;
	    			if(OutParamTypeEnum.INTEGER.getCode().equals(jsonObject.getString("paramType")))
	    			{
	    				int outParam = cstm.getInt(index);
	    				map.put(paramCode, outParam);
	    			}else if(OutParamTypeEnum.VARCHAR.getCode().equals(jsonObject.getString("paramType")))
		    		{
	    				String outParam = cstm.getString(index);
	    				map.put(paramCode, outParam);
		    		}else if(OutParamTypeEnum.BIGINT.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			long outParam = cstm.getLong(index);
		    			map.put(paramCode, outParam);
		    		}else if(OutParamTypeEnum.FLOAT.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			float outParam = cstm.getFloat(index);
		    			map.put(paramCode, outParam);
		    		}else if(OutParamTypeEnum.DOUBLE.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			double outParam = cstm.getDouble(index);
		    			map.put(paramCode, outParam);
		    		}else if(OutParamTypeEnum.DECIMAL.getCode().equals(jsonObject.getString("paramType"))) 
		    		{
		    			BigDecimal outParam = cstm.getBigDecimal(index);
		    			map.put(paramCode, outParam);
		    		}
	    		}
	    		result.add(map);
	    	}
		} catch (Exception ex) {
			throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
		} finally {
            JdbcUtils.releaseJdbcResource(conn, cstm, rs);
        }
		return result;
	}
	
	/**  
	 * @Title: getSelectData
	 * @Description: 获取下拉选择框数据
	 * @param dataSource
	 * @param sqlText
	 * @return
	 * @author caiyang
	 * @date 2021-11-18 02:15:52 
	 */ 
	public static List<Map<String, Object>> getSelectData(DataSource dataSource, String sqlText) {
		Connection conn = null;
	    Statement stmt = null;
	    ResultSet rs = null;
	    List<Map<String, Object>> result = null;
	    try {
	    	conn = dataSource.getConnection();
	    	stmt = conn.createStatement();
            rs = stmt.executeQuery(sqlText);
            final ResultSetMetaData rsMataData = rs.getMetaData();
            final int count = rsMataData.getColumnCount();
            result = new ArrayList<>(count);
            while(rs.next()){
                Map<String, Object> map = new HashMap<String, Object>();
                for(int i = 0; i < count; i++){
                 map.put(rsMataData.getColumnLabel(i+1).toLowerCase(), rs.getObject(rsMataData.getColumnLabel(i+1)));
                }
                result.add(map);
            }
        } catch (final SQLException ex) {
        	throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, stmt, rs);
        }
	    return result;
	}
	
	/**  
	 * @Title: getDataCountBySQL
	 * @Description: 获取数据总条数
	 * @param dataSource
	 * @param sqlText
	 * @return
	 * @author caiyang
	 * @date 2021-11-18 02:16:18 
	 */ 
	public static int getDataCountBySQL(DataSource dataSource, String sqlText) {
		int result = 0;
		Connection conn = null;
	    Statement stmt = null;
	    ResultSet rs = null;
	    try {
	    	conn = dataSource.getConnection();
	    	stmt = conn.createStatement();
            rs = stmt.executeQuery(sqlText);
            rs.next();
            result = rs.getInt(1);
        } catch (final SQLException ex) {
        	throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, stmt, rs);
        }
		return result;
	}
	
	public static int getDataCountBySQL(Connection conn, String sqlText) {
		int result = 0;
	    Statement stmt = null;
	    ResultSet rs = null;
	    try {
	    	stmt = conn.createStatement();
            rs = stmt.executeQuery(sqlText);
            rs.next();
            result = rs.getInt(1);
        } catch (final SQLException ex) {
        	throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, stmt, rs);
        }
		return result;
	}
	
	/**  
	 * @MethodName: getInfluxdbDataCountBySQL
	 * @Description: influxdb获取数据总条数
	 * @author caiyang
	 * @param connection
	 * @param sqlText
	 * @return 
	 * @return int
	 * @date 2022-12-15 02:31:04 
	 */  
	public static int getInfluxdbDataCountBySQL(InfluxDBConnection connection, String sqlText) {
		int result = 0;
		QueryResult queryResult = connection.query(sqlText);
		if(queryResult.getResults().get(0).getSeries() != null)
		{
			List<List<Object>> values= queryResult.getResults().get(0).getSeries().get(0).getValues();
			if(!ListUtil.isEmpty(values))
			{
				List<Object> rowValues = values.get(0);
				if(rowValues.size() == 1)
				{
					Double count = (double) rowValues.get(0);
					result = count.intValue();
				}else {
					Double count = (double) rowValues.get(1);
					result = count.intValue();
				}
			}
		}
		return result;
	}
	
	/**  
	 * @MethodName: reportData
	 * @Description: 上报数据
	 * @author caiyang
	 * @param dataSource
	 * @param details 
	 * @return void
	 * @date 2022-11-23 11:13:44 
	 */  
	public static void reportData(DataSource dataSource,Map<String, List<ReportDataDetailDto>> mapDetails,int type) {
		if(type == 1)
		{//mysql类型处理
			processMysqlReportData(dataSource,mapDetails);
		}else {
			procesOtherDatabase(dataSource,mapDetails,type);
		}
	}
	
	/**  
	 * @MethodName: processMysqlReportData
	 * @Description: mysql上报数据处理
	 * @author caiyang
	 * @param dataSource
	 * @param mapDetails 
	 * @return void
	 * @date 2022-11-24 08:43:03 
	 */  
	private static void processMysqlReportData(DataSource dataSource,Map<String, List<ReportDataDetailDto>> mapDetails) {
		Connection conn = null;
	    PreparedStatement ps = null;
	    try {
	    	conn = dataSource.getConnection();
	    	Set<String> tableNames = mapDetails.keySet();
	    	Map<String, List<List<Object>>> sqlParamsMap = new HashMap<>(); 
	    	for(String tableName : tableNames)
	    	{
	    		List<ReportDataDetailDto> details = mapDetails.get(tableName);
	    		if(!ListUtil.isEmpty(details))
	    		{
	    			for (int i = 0; i < details.size(); i++) {
	    				List<Object> params = new ArrayList<>();
	    				String columnSql = "";
		    			String paramSql = "";
		    			String duplicateKeySql = "";
	    				List<ReportDataColumnDto> columns = details.get(i).getColumns();
	    				for (int j = 0; j < columns.size(); j++) {
	    					params.add(columns.get(j).getData());
	    					if(j == 0)
	    					{
	    						columnSql = columnSql + columns.get(j).getColumnName();
	    						paramSql = paramSql + "?";
	    						duplicateKeySql = duplicateKeySql + columns.get(j).getColumnName() + "= ?"; 
	    					}else {
	    						columnSql = columnSql + "," + columns.get(j).getColumnName();
	    						paramSql = paramSql + "," + "?";
	    						duplicateKeySql = duplicateKeySql + "," + columns.get(j).getColumnName() + "= ?"; 
	    					}
						}
	    				String sql = "INSERT INTO " + tableName + "(" + columnSql + ") VALUES (" + paramSql + ") ON DUPLICATE KEY UPDATE " + duplicateKeySql; 
	    				if(sqlParamsMap.get(sql) == null)
	    				{
	    					List<List<Object>> list = new ArrayList<>();
	    					list.add(params);
	    					sqlParamsMap.put(sql, list);
	    				}else {
	    					sqlParamsMap.get(sql).add(params);
	    				}
	    			}
	    		}
	    	}
	    	if(!sqlParamsMap.isEmpty())
	    	{
	    		conn.setAutoCommit(false);
	    		Set<String> sqls = sqlParamsMap.keySet();
	    		for(String sql : sqls)
	    		{
	    			ps = conn.prepareStatement(sql);
	    			List<List<Object>> params = sqlParamsMap.get(sql);
	    			for (int i = 0; i < params.size(); i++) {
	    				List<Object> rowParams = params.get(i);
	    				for (int j = 0; j < rowParams.size(); j++) {
							ps.setObject(j+1, rowParams.get(j));
							ps.setObject(j+1+rowParams.size(), rowParams.get(j));
						}
	    				ps.addBatch();
					}
	    			ps.executeBatch();
	    			ps.clearBatch();
	    			ps.close();
	    		}
	    		conn.commit();
	    	}
        } catch (final SQLException ex) {
        	throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn, ps, null);
        }
	}
	
	/**  
	 * @MethodName: procesOtherDatabase
	 * @Description: 处理其他数据库的数据上报
	 * @author caiyang
	 * @param dataSource
	 * @param mapDetails 
	 * @return void
	 * @date 2022-11-24 09:23:17 
	 */  
	private static void procesOtherDatabase(DataSource dataSource,Map<String, List<ReportDataDetailDto>> mapDetails,int type) {
		Connection conn = null;
	    PreparedStatement ps = null;
	    ResultSet rs = null;
	    try {
	    	conn = dataSource.getConnection();
	    	Set<String> tableNames = mapDetails.keySet();
	    	Map<String, List<List<Object>>> sqlParamsMap = new HashMap<>(); 
	    	for(String tableName : tableNames)
	    	{
	    		List<ReportDataDetailDto> details = mapDetails.get(tableName);
	    		if(!ListUtil.isEmpty(details))
	    		{
	    			for (int i = 0; i < details.size(); i++) {
	    				 List<ReportDataColumnDto> keys = details.get(i).getKeys();
	    				 List<ReportDataColumnDto> columns = details.get(i).getColumns();
	    				 if(ListUtil.isEmpty(keys))
	    				 {//没有设置主键，则是新增数据
	    					 processInsertSql(columns,sqlParamsMap,tableName);
	    				 }else {
	    					 //有自增主键则是新增数据，否则需要先根据主键查询是否存在，存在则更新，不存在则新增
	    					 boolean isAutoKey = false;
	    					 for (int j = 0; j < keys.size(); j++) {
								if(keys.get(j).getIdType().intValue() == 3)
								{
									isAutoKey = true;
									break;
								}
							}
	    					if(isAutoKey)
	    					{
	    						processInsertSql(columns,sqlParamsMap,tableName);
	    					}else {
	    						String whereSql = " ";
	    						List<Object> whereParams = new ArrayList<>();
	    						for (int j = 0; j < keys.size(); j++) {
	    							whereParams.add(keys.get(j).getData());
	    							if(j == 0)
	    							{
	    								whereSql = whereSql + keys.get(j).getColumnName() + " = ?";
	    							}else {
	    								whereSql = whereSql + " AND " + keys.get(j).getColumnName() + " = ?";
	    							}
	    						}
	    						String selectSql = "select * from " + tableName + " where " + whereSql;
	    						selectSql = JdbcUtils.preprocessSqlText(selectSql, type,null);
	    						ps = conn.prepareStatement(selectSql);
	    						if(!ListUtil.isEmpty(whereParams))
	    						{
	    							for (int j = 0; j < whereParams.size(); j++) {
										ps.setObject(j+1, whereParams.get(j));
									}
	    						}
	    						rs = ps.executeQuery();
	    						if(!rs.next())
	    						{//没有数据，新增
	    							processInsertSql(columns,sqlParamsMap,tableName);
	    						}else {
	    							//有数据，更新
	    							processUpdateSql(columns,keys,sqlParamsMap,tableName);
	    						}
	    						ps.close();	
	    					}
	    				 }
	    			}
	    		}
	    	}
	    	if(!sqlParamsMap.isEmpty())
	    	{
	    		conn.setAutoCommit(false);
	    		Set<String> sqls = sqlParamsMap.keySet();
	    		for(String sql : sqls)
	    		{
	    			ps = conn.prepareStatement(sql);
	    			List<List<Object>> params = sqlParamsMap.get(sql);
	    			for (int i = 0; i < params.size(); i++) {
	    				List<Object> rowParams = params.get(i);
	    				for (int j = 0; j < rowParams.size(); j++) {
							ps.setObject(j+1, rowParams.get(j));
						}
	    				ps.addBatch();
	    			}
	    			ps.executeBatch();
	    			ps.clearBatch();
	    			ps.close();
	    		}
	    		conn.commit();
	    	}
        } catch (final SQLException ex) {
        	throw new BizException(StatusCode.FAILURE,"sql语句执行错误，请检查sql语句是否拼写正确或者数据源是否选择正确。错误信息："+ex.getMessage());
        } finally {
            JdbcUtils.releaseJdbcResource(conn,ps, rs);
        }
	}
	
	/**  
	 * @MethodName: processInsertSql
	 * @Description: 新增语句处理
	 * @author caiyang
	 * @param columns
	 * @param sqlParamsMap
	 * @param tableName 
	 * @return void
	 * @date 2022-11-24 10:33:19 
	 */  
	private static void processInsertSql(List<ReportDataColumnDto> columns,Map<String, List<List<Object>>> sqlParamsMap,String tableName)
	{
		List<Object> params = new ArrayList<>();
		String columnSql = "";
		String paramSql = "";
		for (int j = 0; j < columns.size(); j++) {
			 params.add(columns.get(j).getData());
			 if(j == 0)
			 {
				 columnSql = columnSql + columns.get(j).getColumnName();
				 paramSql = paramSql + "?";
			 }else {
				 columnSql = columnSql + "," + columns.get(j).getColumnName();
				 paramSql = paramSql + "," + "?"; 
			 }
		 }
		 String sql = "INSERT INTO " + tableName + "(" + columnSql + ") VALUES (" + paramSql + ")";
		 if(sqlParamsMap.get(sql) == null)
		 {
			List<List<Object>> list = new ArrayList<>();
			list.add(params);
			sqlParamsMap.put(sql, list);
		 }else {
			 sqlParamsMap.get(sql).add(params);
		 }
	}
	
	/**  
	 * @MethodName: processUpdateSql
	 * @Description: 处理更新sql
	 * @author caiyang
	 * @param columns
	 * @param sqlParamsMap
	 * @param tableName 
	 * @return void
	 * @date 2022-11-24 10:55:16 
	 */  
	private static void processUpdateSql(List<ReportDataColumnDto> columns,List<ReportDataColumnDto> keys,Map<String, List<List<Object>>> sqlParamsMap,String tableName)
	{
		List<Object> params = new ArrayList<>();
		String columnSql = "";
		String whereSql = " ";
		for (int j = 0; j < columns.size(); j++) {
			params.add(columns.get(j).getData());
			if(j == 0)
			{
				columnSql = columnSql + columns.get(j).getColumnName() + " = ?";
			}else {
				columnSql = columnSql + "," + columns.get(j).getColumnName() + " = ?";
			}
		}
		for (int j = 0; j < keys.size(); j++) {
			params.add(keys.get(j).getData());
			if(j == 0)
			{
				whereSql = whereSql + keys.get(j).getColumnName() + " = ?";
			}else {
				whereSql = whereSql + "AND " + keys.get(j).getColumnName() + " = ?";
			}
		}
		String sql = "UPDATE " + tableName + " SET " + columnSql + " where " + whereSql;
		if(sqlParamsMap.get(sql) == null)
		 {
			List<List<Object>> list = new ArrayList<>();
			list.add(params);
			sqlParamsMap.put(sql, list);
		 }else {
			 sqlParamsMap.get(sql).add(params);
		 }
	}
}