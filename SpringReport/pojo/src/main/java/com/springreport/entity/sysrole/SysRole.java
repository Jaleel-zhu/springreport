 /** 
 * 模块：报表系统-SysRole
 * 本文件由代码生成器自动完成,不允许进行修改
 */
package com.springreport.entity.sysrole;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.springreport.base.PageEntity;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

 /**  
* @Description: sys_role - 
* @author 
* @date 2021-06-15 07:11:49
* @version V1.0  
 */
@Data
@TableName("sys_role")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SysRole extends PageEntity {

    /** id - 主键id */
    
    @TableId(value = "id",type = IdType.ASSIGN_ID)
    private Long id;

    /** merchant_no - 商户号 */
    @TableField("merchant_no")
    private String merchantNo;

    /** role_code - 角色代码 */
    @TableField("role_code")
    private String roleCode;

    /** role_name - 角色名称 */
    @TableField("role_name")
    private String roleName;

    /** role_desc - 角色描述 */
    @TableField("role_desc")
    private String roleDesc;

    /** creator - 创建人 */
    @TableField(value = "creator",fill = FieldFill.INSERT)
    private Long creator;

    /** create_time - 创建时间 */
    @TableField(value = "create_time",fill = FieldFill.INSERT)
    private Date createTime;

    /** updater - 更新人 */
   @TableField(value = "updater",fill = FieldFill.INSERT_UPDATE)
    private Long updater;

    /** update_time - 更新时间 */
    @TableField(value = "update_time",fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    /** del_flag - 删除标记 1未删除 2已删除 */
    @TableField("del_flag")
    private Integer delFlag;
}