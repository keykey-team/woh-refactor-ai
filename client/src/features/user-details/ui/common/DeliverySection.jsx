"use client"
import { useI18n } from '@shared';
import React, { useEffect, useMemo } from 'react';

import { DELIVERY_TYPES } from '../../const/delivery';
import { useDeliveryLogic } from '../../lib/useDeliveryLogic';
import AutoCompleteSelect from './AutoCompleteSelect';

const DeliverySection = ({ formik }) => {
    const { t } = useI18n();
    const { values, errors, touched, setFieldValue, handleChange, handleBlur } = formik;
    const isSubmitting = Boolean(formik?.isSubmitting);
    
    const { 
        isLoading, 
        apiError, 
        shouldLoadDeliveryData, 
        areaOptions, 
        cityOptions, 
        warehouseOptions 
    } = useDeliveryLogic(values, setFieldValue, t);

    const deliveryTypeOptions = useMemo(() => [
        { value: DELIVERY_TYPES.NOVA_POSHTA_BRANCH, label: t('checkout.npBranch') },
        { value: DELIVERY_TYPES.UKR_POSHTA, label: t('checkout.ukrPoshta') }
    ], [t]);

    useEffect(() => {
        if (!values.deliveryType) {
            setFieldValue("deliveryType", DELIVERY_TYPES.NOVA_POSHTA_BRANCH);
        }
    }, [values.deliveryType, setFieldValue]);

    const handleDeliveryTypeSelect = (selectedOption) => {
        const type = selectedOption ? selectedOption.value : "";
        setFieldValue("deliveryType", type);
        setFieldValue("area", "");
        setFieldValue("city", "");
        setFieldValue("warehouse", "");
    };

    const handleSelect = (fieldName) => (selectedOption) => {
        setFieldValue(fieldName, selectedOption ? selectedOption.value : "");
    };

    return (
        <>
            <div className="form-group">
                <AutoCompleteSelect
                    id="delivery-type-select"
                    label={t('checkout.deliveryMethod')}
                    name="deliveryType"
                    value={values.deliveryType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onSelectOption={handleDeliveryTypeSelect}
                    options={deliveryTypeOptions}
                    error={errors.deliveryType}
                    touched={touched.deliveryType}
                    placeholder={t('checkout.chooseDeliveryMethod')}
                />
            </div>

            {shouldLoadDeliveryData() && (
                <>
                    {apiError && (areaOptions.length === 0 || cityOptions.length === 0 || warehouseOptions.length === 0) ? (
                        <div className="error-text" role="alert" aria-live="polite">
                            {apiError}
                        </div>
                    ) : null}

                    <div className="form-group">
                        <AutoCompleteSelect
                            id="area-select" 
                            label={t('checkout.region')} 
                            name="area"
                            value={values.area} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            onSelectOption={handleSelect("area")}
                            disabled={!values.deliveryType || areaOptions.length === 0 || isLoading || isSubmitting}
                            options={areaOptions} 
                            error={errors.area} 
                            touched={touched.area}
                            placeholder={areaOptions.length === 0 ? t('checkout.loading') : t('checkout.chooseRegion')}
                        />
                    </div>

                    <div className="form-group">
                        <AutoCompleteSelect
                            id="city-select" 
                            label={t('checkout.city')} 
                            name="city"
                            value={values.city} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            onSelectOption={handleSelect("city")}
                            disabled={!values.area || cityOptions.length === 0 || isLoading || isSubmitting}
                            options={cityOptions} 
                            error={errors.city} 
                            touched={touched.city}
                            placeholder={!values.area ? t('checkout.chooseRegionFirst') : t('checkout.chooseCity')}
                        />
                    </div>

                    <div className="form-group">
                        <AutoCompleteSelect
                            id="warehouse-select" 
                            label={t('checkout.branch')} 
                            name="warehouse"
                            value={values.warehouse} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            onSelectOption={handleSelect("warehouse")}
                            disabled={!values.city || warehouseOptions.length === 0 || isLoading || isSubmitting}
                            options={warehouseOptions} 
                            error={errors.warehouse} 
                            touched={touched.warehouse}
                            placeholder={!values.city ? t('checkout.chooseCityFirst') : t('checkout.chooseBranch')}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default DeliverySection;