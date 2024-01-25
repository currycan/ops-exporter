// Namespace.
var ops-exporter = {};

ops-exporter.labels = {};
ops-exporter.panel = null;

ops-exporter.switchToMetrics = function(){
    $('#metrics-div').show();
    $('#status-div').hide();
    $('#metrics-li').addClass('active');
    $('#status-li').removeClass('active');
}

ops-exporter.switchToStatus = function(){
    $('#metrics-div').hide();
    $('#status-div').show();
    $('#metrics-li').removeClass('active');
    $('#status-li').addClass('active');
}

ops-exporter.showDelModal = function(labels, labelsEncoded, panelID, event){
    event.stopPropagation(); // Don't trigger accordion collapse.
    ops-exporter.labels = labelsEncoded;
    ops-exporter.panel = $('#' + panelID).parent();

    var components = [];
    for (var ln in labels) {
	components.push(ln + '="' + labels[ln] + '"')
    }
    
    $('#del-modal-msg').text(
	'Do you really want to delete all metrics of group {' + components.join(', ') + '}?'
    );
    $('#del-modal').modal('show');
}

ops-exporter.showDelAllModal = function(){
    if (!$('button#del-all').hasClass('disabled')) {
        $('#del-modal-all-msg').text(
            'Do you really want to delete all metrics from all metric groups?'
        );
        $('#del-all-modal').modal('show');
    }
}

ops-exporter.deleteGroup = function(){
    var pathElements = [];
    for (var ln in ops-exporter.labels) {
	if (ln != 'job') {
	    pathElements.push(encodeURIComponent(ln+'@base64'));
	    // Always add a padding '=' to ensure empty label values work.
	    pathElements.push(encodeURIComponent(ops-exporter.labels[ln]+'='));
	}
    }
    var groupPath = pathElements.join('/');
    if (groupPath.length > 0) {
	groupPath = '/' + groupPath;
    }
    
    $.ajax({
	type: 'DELETE',
	url: 'metrics/job@base64/' + encodeURIComponent(ops-exporter.labels['job']) + groupPath,
	success: function(data, textStatus, jqXHR) {
	    ops-exporter.panel.remove();
        ops-exporter.decreaseDelAllCounter();
	    $('#del-modal').modal('hide');
	},
	error: function(jqXHR, textStatus, error) {
	    alert('Deleting metric group failed: ' + error);
	}
    });
}

ops-exporter.deleteAllGroup = function(){
    $.ajax({
        type: 'PUT',
        url: 'api/v1/admin/wipe',
        success: function(data, textStatus, jqXHR) {
            $('div').each(function() {
                id = $(this).attr("id");
                if (typeof id != 'undefined' && id.match(/^group-panel-[0-9]{1,}$/)) {
                    $(this).parent().remove();
                }
            });
            ops-exporter.setDelAllCounter(0);
            $('#del-all-modal').modal('hide');
        },
        error: function(jqXHR, textStatus, error) {
            alert('Deleting all metric groups failed: ' + error);
        }
    });
}

ops-exporter.decreaseDelAllCounter = function(){
    var counter = parseInt($('span#del-all-counter').text());
    ops-exporter.setDelAllCounter(--counter);
}

ops-exporter.setDelAllCounter = function(n){
    $('span#del-all-counter').text(n);
    if (n <= 0) {
        ops-exporter.disableDelAllGroupButton();
        return;
    }
    ops-exporter.enableDelAllGroupButton();
}

ops-exporter.enableDelAllGroupButton = function(){
    $('button#del-all').removeClass('disabled');
}

ops-exporter.disableDelAllGroupButton = function(){
    $('button#del-all').addClass('disabled');
}

$(function () {
    $('div.collapse').on('show.bs.collapse', function (event) {
	$(this).prev().find('span.toggle-icon')
	    .removeClass('glyphicon-collapse-down')
	    .addClass('glyphicon-collapse-up');
	event.stopPropagation();

	sessionStorage.setItem("coll_" + this.id, true);
    })
    $('div.collapse').on('hide.bs.collapse', function (event) {
	$(this).prev().find('span.toggle-icon')
	    .removeClass('glyphicon-collapse-up')
	    .addClass('glyphicon-collapse-down');
	event.stopPropagation();

	sessionStorage.setItem("coll_" + this.id, false);
    })

    $("div.collapse").each(function() {
	if (sessionStorage.getItem("coll_" + this.id) == "true") {
	    $(this).collapse("show");
	}
    });
})
