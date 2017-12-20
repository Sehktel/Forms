// Функция умеет работать с отображением элемента заполнения и возвращать в исходное
filling = function (n) {
    function showFilling(n) {
        if (paper.elm(n)._attr.hasOwnProperty('_dimlns')) {
            paper.elm(n)._attr._dimlns.visible = true;
        }
        paper.project.draw_fragment({
            elm: n
        });
        return true;
    }
    function showProduct() {
        paper.project.draw_fragment({
            elm: -1
        });
        if (paper.elm(n)._attr.hasOwnProperty('_dimlns')) {
            paper.elm(n)._attr._dimlns.visible = false;
        }
        return false;
    }

    if (!this.show) {
        this.show = showFilling(n);
    } else {
        this.show = showProduct();
    }
}
filling.show = false;

//И при вызове в консоли разработчика:
filling(n); //отобразит n-ный элемент с размерными линиями
filling(n); // еще раз скроет n-ный элемент и вернет эскиз всего изделия
