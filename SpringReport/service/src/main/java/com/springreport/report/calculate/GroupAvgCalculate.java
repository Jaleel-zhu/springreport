package com.springreport.report.calculate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Set;

import com.googlecode.aviator.AviatorEvaluator;
import com.springreport.dto.reporttpl.GroupSummaryData;
import com.springreport.util.CheckUtil;
import com.springreport.util.ListUtil;

/**  
 * @ClassName: GroupAvgCalculate
 * @Description: 分组平均数计算
 * @author caiyang
 * @date 2022-02-19 10:19:36 
*/  
public class GroupAvgCalculate extends Calculate<GroupSummaryData>{

	@Override
	public String calculate(GroupSummaryData bindData) {
		BigDecimal result = new BigDecimal(0);
		BigDecimal sum = new BigDecimal(0);
		int size = 0;
		for (int i = 0; i < bindData.getDatas().size(); i++) {
			String property = bindData.getProperty();
			Object object = null;
			Map<String, Object> datas = ListUtil.getProperties(bindData.getProperty(), bindData.getDatas().get(i));
			Set<String> set = datas.keySet();
			if(set.size() > 1)
			{
				for (String o : set) {
		        	property = property.replace(o, datas.get(o)==null?"":String.valueOf(datas.get(o)));
		        }
				try {
					object = AviatorEvaluator.execute(property);
				} catch (Exception e) {
					object = 0;
				}
			}else {
				object = bindData.getDatas().get(i).get(property);
			}
			if(CheckUtil.isNumber(String.valueOf(object)))
			{
				sum = sum.add(new BigDecimal(String.valueOf(object)));
			}
			size = size + 1;
		}
		result = sum.divide(new BigDecimal(size),bindData.getDigit(),BigDecimal.ROUND_HALF_UP);
		return String.valueOf(result);
	}

}