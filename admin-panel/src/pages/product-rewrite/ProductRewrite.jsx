import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../features/product-form/ui/ProductForm';
import { useFetchProductGroup } from '../../pages/product-rewrite/lib/useFetchProductGroup';

export default function ProductRewritePage() {
    const navigate = useNavigate();
    const { id } = useParams();


    const { productGroup, productVariation, isLoading, error, isCreateMode } = useFetchProductGroup(id);

    console.log(productGroup, "productGroup");
    console.log(productVariation, "productVariation");

    return (
        <>
            <section className="section-admin section-form">
                <div className="section-form__header">
                    <h2>{isCreateMode ? 'Додавання товару' : 'Редагування товару'}</h2>
                    <button onClick={() => navigate("/products")}>Повернутися</button>
                </div>

                <div className="section-form__content">




                    {!isLoading && !error && (
                        <ProductForm
                            type={id}
                            variationsData={productVariation}
                            initialData={productGroup}
                            isEditMode={!isCreateMode}
                        />
                    )}

                </div>
            </section>
            <button form="product-create-form" className="product-form__submit" type="submit">
                {productGroup ? 'Зберегти' : 'Додати'}
            </button></>

    );
}