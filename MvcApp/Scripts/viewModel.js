function ViewModel(options) {
    var self = this;

    //���⡢���ݼ��������Ի�������ݣ�HTML��
    self.title          = ko.observable(options.title);
    self.recordSet      = ko.observableArray();
    self.dialogContent  = ko.observable();
    self.dialog         = options.dialogId ? $("#" + options.dialogId) : $("#dialog");

    //����
    //orderBy��defaultOrderBy & isAsc: ��ǰ�����ֶ�����Ĭ�������ֶ����ͷ�������/����
    //totalPages�� pageNumbers & pageIndex����ҳ����ҳ���б�͵�ǰҳ
    self.orderBy        = ko.observable();
    self.isAsc          = ko.observable();
    self.defaultOrderBy = options.defaultOrderBy;

    //��ҳ
    //totalPages�� pageNumbers & pageIndex����ҳ����ҳ���б�͵�ǰҳ
    self.totalPages     = ko.observable();
    self.pageNumbers    = ko.observableArray();
    self.pageIndex      = ko.observable();

    //��ѯ��������ǩ������ֵ
    self.searchCriteria = ko.observableArray(options.searchCriteria);

    //��Ϊ��ʾ���ݵı���ͷ������ʾ���ֺͶ�Ӧ���ֶ�������������
    self.headers = ko.observableArray(options.headers);

    //CRUD��ͨ��ajax����ʵ�֣������ṩ���ڻ�ȡajax�����ַ�ķ���
    self.dataQueryUrlAccessor   = options.dataQueryUrlAccessor;
    self.dataAddUrlAccessor     = options.dataAddUrlAccessor;
    self.dataUpdateAccessor     = options.dataUpdateAccessor;
    self.dataDeleteAccessor     = options.dataDeleteAccessor;

    //removeData��ɾ��������ɺ����ݴ�recordSet���Ƴ�
    //replaceData���޸Ĳ��������recordSet����Ӧ��¼
    self.removeData     = options.removeData;
    self.replaceData    = options.replaceData;

    //Search��ť
    self.search = function () {
        self.orderBy(self.defaultOrderBy);
        self.isAsc(true);
        self.pageIndex(1);
        $.ajax(
        {
            url: self.dataQueryUrlAccessor(self),
            type: "GET",
            success: function (result) {
                self.recordSet(result.Data);
                self.totalPages(result.TotalPages);
                self.resetPageNumbders();
            }
        });
    };

    //Reset��ť
    self.reset = function () {
        for (var i = 0; i < self.searchCriteria().length; i++) {
            self.searchCriteria()[i].value("");
        }
    };

    //��ȡ����֮����ݼ�¼������ҳ��
    self.resetPageNumbders = function () {
        self.pageNumbers.removeAll();
        for (var i = 1; i <= self.totalPages(); i++) {
            self.pageNumbers.push(i);
        }
    };

    //������ͷ����������
    self.sort = function (header) {
        if (self.orderBy() == header.value) {
            self.isAsc(!self.isAsc());
        }
        self.orderBy(header.value);
        self.pageIndex(1);
        $.ajax(
        {
            url: self.dataQueryUrlAccessor(self),
            type: "GET",
            success: function (result) {
                self.recordSet(result.Data);
            }
        });
    };

    //���ҳ���ȡ��ǰҳ����
    self.turnPage = function (pageIndex) {
        self.pageIndex(pageIndex);
        $.ajax(
        {
            url: self.dataQueryUrlAccessor(self),
            type: "GET",
            success: function (result) {
                self.recordSet(result.Data);
            }
        });
    };

    //���Add��ť������������ݡ��Ի���
    self.onDataAdding = function () {
        $.ajax(
        {
            url: self.dataAddUrlAccessor(self),
            type: "GET",
            success: function (result) {
                self.dialogContent(result);
                self.dialog.modal("show");
            }
        });
    };

    //�����������ݡ��Ի����Save��ť�رնԻ��򣬲�����ӵļ�¼����recordSet
    self.onDataAdded = function (data) {
        self.dialog.modal("hide");
        self.recordSet.unshift(data);
    };

    //���Update��ť�������޸����ݡ��Ի���
    self.onDataUpdating = function (data) {
        $.ajax(
        {
            url: self.dataUpdateAccessor(data, self),
            type: "GET",
            success: function (result) {
                self.dialogContent(result);
                self.dialog.modal("show");
            }
        });
    };

    //������޸����ݡ��Ի����Save��ť�رնԻ��򣬲��޸�recordSet�е�����
    self.onDataUpdated = function (data) {
        self.dialog.modal("hide");
        self.replaceData(data, self);
    };

    //���Delete��ťɾ����ǰ��¼
    self.onDataDeleting = function (data) {
        $.ajax(
        {
            url: self.dataDeleteAccessor(data, self),
            type: "GET",
            success: function (result) {
                self.removeData(result, self);
            }
        });
    };
}