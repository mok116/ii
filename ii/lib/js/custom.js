(function($) {

	var template = {

		_id: "",
		_name: "",

		init: function() {

			template.selectTemplate();
			template.addCampaign();

			template.previewTemplate();
		},

		selectTemplate: function() {

			$('.template-row').click(function() {

				$('.template-row').removeClass("active");

				$(this).addClass("active");

				template._id = this.id.replace(/template-/g, "");
				template._name = $(this).find('.template-name').text();

				$('#grid-msg').html('<span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span> You Have Selected <strong>' + template._name + "</strong> For Create Campaign.");

				$('.btn-add-campaign').addClass('btn-success').removeClass('btn-default');

				$('.template-row.active').unbind('click');
				$('.template-row.active').bind('click', template.unSelectTemplate());
			});
		},

		unSelectTemplate: function() {

			$('.template-row.active').click(function() {

				$('.template-row').removeClass("active");

				template._id = "";
				template._name = "";

				$('#grid-msg').html('<span class="glyphicon glyphicon-hand-down" aria-hidden="true"></span> Please Select Template to Create Campaign.');

				$('.btn-add-campaign').addClass('btn-default').removeClass('btn-success');

				$('.template-row').unbind('click');
				$('.template-row').bind('click', template.selectTemplate());
			});
		},

		addCampaign: function() {

			$('.btn-add-campaign').click(function() {

				var dialogMsg = "You are not using any Template to Create Campaign.";
				var dialogType = "type-danger";

				if(template._name != "") {

					dialogMsg = "You Have Selected <strong>" + template._name + "</strong> For Creating Campaign.<br/><br/>Please Select the input method.";
					dialogType = "type-primary";
				}

				BootstrapDialog.show({

					type: dialogType,
					title: 'Try to Create Campaign',
		            message: dialogMsg,
		            buttons: [ 
		            {
		                label: '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> TextBox',
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    $('.template-content').hide();
		                    $('.campaign-form-content').show();

		                   	// form init
		                   	campaignForm.clearForm();

		                   	// form
							$('#create-campaign-form').show();
							$('#csv-campaign-form').hide();

		                    // close dialog
		                    dialogItself.close();

		                    // setter
		                    $(".template-id").val(template._id);
		                    $(".form-template-name").html(template._name);
		                }
		            },
		            {
		                label: '<span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span> CSV',
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    $('.template-content').hide();
		                    $('.campaign-form-content').show();

		                   	// form init
		                   	campaignForm.clearForm();

		                   	// form
							$('#create-campaign-form').hide();
							$('#csv-campaign-form').show();

		                    // close dialog
		                    dialogItself.close();

		                    // setter
		                    $(".template-id").val(template._id);
		                    $(".form-template-name").html(template._name);
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		previewTemplate: function() {

			$(".btn-preview-template").click(function() {

		        var templateId = $(this).parent().parent().attr('id').replace(/template-/g, "");

				BootstrapDialog.show({

		            title: 'Preview',
		            message: '<iframe id="preview-iframe" style="background-color:#fff; width: 100%; min-height: '+$(window).height()*0.7 +'px; border: none;">Loading...</iframe>',
		            onshown: function(dialogRef) {

		            	var $frame = $('#preview-iframe');

		            	var data = {

		            		template_id : templateId,
		            	};

						$.ajax({

							url: 'ajax/template.php',
							type: "POST",
							data: data,
							dataType: 'json',
			                beforeSend: function(responses) {},
			                success: function(responses) {

			                	if(responses.success) {

			                		if(responses.html) {

									    setTimeout( function() {
								            var doc = $frame[0].contentWindow.document;
								            var $body = $('body',doc);
								            $body.html(responses.meta + responses.css + responses.html);
									    }, 1 );
			                		}
			                	}
			                },
							error: function(responses) {

								BootstrapDialog.show({

									type: "type-danger",
									title: 'Error Message',
						            message: responses.responseText,
						        });
							},
							complete: function() {}
						});
		            },
		            buttons: [ 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},
	};

	if($('.template-content').length > 0) {

		template.init();
	}

	var campaignForm = {

		_itemCount: 1,
		_files: "",

		init: function() {

			campaignForm.resetForm();
			campaignForm.backToTemplate();
			campaignForm.addNewItem();
			campaignForm.downloadCSVTemplate();

			// input submit
			$("#create-campaign-form").submit(function(e) {

		        e.preventDefault();
		        e.stopPropagation();

		        campaignForm.createCampaign();
		    });

		    $('#csv-upload').on('change', function(e) {

		    	campaignForm._files = e.target.files;
		    });

		    $("#csv-campaign-form").submit(function(e) {

		        e.preventDefault();
		        e.stopPropagation();

		        campaignForm.uploadCSV();
		    });
		},

		resetForm: function() {

			campaignForm.clearForm();

			// form
			$('#create-campaign-form').show();
			$('#csv-campaign-form').hide();
		},

		clearForm: function() {

			// reset form
			$('#create-campaign-form')[0].reset();
			$('#csv-campaign-form')[0].reset();
			campaignForm._itemCount = 1;

			// item remove
			$('.added-item').remove();
		},

		backToTemplate: function() {

			$('.btn-back-to-template').click(function() {

				/*campaignForm.resetForm();

				// content
				$('.template-content').show();
		        $('.campaign-form-content').hide();*/

		        window.location.reload();
			});
		},

		addNewItem: function() {

			$('.btn-add-new-item').click(function() {

				campaignForm._itemCount++;

				var symbol = $('#symbol').val();

				var html = '<div id="item-'+campaignForm._itemCount+'" class="added-item"><div class="item-number">Item '+campaignForm._itemCount+': <button type="button" class="btn btn-danger btn-del-item" id="del-item-'+campaignForm._itemCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Name*</label><div class="col-sm-4"><input type="text" name="item['+campaignForm._itemCount+'][name]" class="form-control" placeholder="Name" ></div><label class="col-sm-2 control-label">Description*</label><div class="col-sm-4"><input type="text" name="item['+campaignForm._itemCount+'][description]" class="form-control" placeholder="Description" ></div></div><div class="form-group"><label class="col-sm-2 control-label">URL*</label><div class="col-sm-10"><input type="text" name="item['+campaignForm._itemCount+'][url]" class="form-control" placeholder="URL" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Image URL*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="item['+campaignForm._itemCount+'][image_url]" class="form-control" placeholder="Image URL" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div><div class="form-group"><label class="col-sm-2 control-label">Button Image</label><div class="col-sm-10"><input type="text" name="item['+campaignForm._itemCount+'][button_image]" class="form-control" placeholder="Button Image"></div></div><div class="form-group"><div class="col-sm-6"><label class="col-sm-4 control-label">Orginal Price*</label><div class="input-group col-sm-8"><div class="input-group-addon">'+symbol+'</div><input type="number" step="0.01" name="item['+campaignForm._itemCount+'][orginal_price]" class="form-control" placeholder="Orginal Price" ></div></div><div class="col-sm-6"><label class="col-sm-4 control-label">Current Price*</label><div class="input-group col-sm-8"><div class="input-group-addon">'+symbol+'</div><input type="number" step="0.01" name="item['+campaignForm._itemCount+'][current_price]" class="form-control" placeholder="Current Price" ></div></div></div>';

				if($('input[name=store_id]').val() == '1') {

					html += '<div class="form-group"><label class="col-sm-2 control-label">Related Banner URL</label><div class="col-sm-10"><input type="text" name="item['+campaignForm._itemCount+'][related_banner_url]" class="form-control" placeholder="Related Banner URL"><span class="help-block">Only Support Some Templates.</span></div></div><div class="form-group"><label class="col-sm-2 control-label">Related Banner Image URL</label><div class="col-sm-10"><div class="input-group"><input type="text" name="item['+campaignForm._itemCount+'][related_banner_image_url]" class="form-control" placeholder="Related Banner Image URL"><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div><span class="help-block">Only Support Some Templates.</span></div></div><div class="form-group"><label class="col-sm-2 control-label">Related Banner Text</label><div class="col-sm-10"><input type="text" name="item['+campaignForm._itemCount+'][related_banner_text]" class="form-control" placeholder="Related Banner Text"><span class="help-block">Only Support Some Templates.</span></div></div>';
				}

				html += '</div>';

				$('.item-list').append(html);

				$('.btn-del-item').unbind('click');
				$('.btn-del-item').bind('click', campaignForm.delItem());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delItem: function() {

			$('.btn-del-item').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-item-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Item' + itemId,
		            message: "Are you sure to Delete <strong>Item " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		createCampaign: function() {

			$.ajax({

				url: 'ajax/createCampaign.php',
				type: "POST",
				data: $("#create-campaign-form").serialize(),
				dataType: 'json',
                beforeSend: function(responses) {

                	common.ajaxLoader(true);
                },
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Create Campaign Success',
						            message: 'Create Campaign Success!',
						            onhidden: function(dialogRef){

						                window.location = 'campaign.php?campaign_id=' + responses.data.data.lastID;
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Create Campaign Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {

					common.ajaxLoader(false);
				}
			});
		},

		uploadCSV: function() {

			var data = new FormData();

		    $.each(campaignForm._files, function(key, value) {

		        data.append(key, value);
		    });

		    data.append("store_id", $('input[name=store_id]').val());
		    data.append("template_id", $('input[name=template_id]').val());
		    data.append("name", $('#campaign-title').val());

		    $.ajax({

		        url: 'ajax/createCampaign.php',
		        type: 'POST',
		        data: data,
		        cache: false,
		        dataType: 'json',
		        processData: false, // Don't process the files
		        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		        beforeSend: function(responses) {

		        	common.ajaxLoader(true);
		        },
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Create Campaign Success',
						            message: 'Create Campaign Success!',
						            onhidden: function(dialogRef){

						                window.location = 'campaign.php?campaign_id=' + responses.data.data.lastID;
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Create Campaign Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {

					common.ajaxLoader(false);
				}
		    });
		},

		downloadCSVTemplate: function() {

			$('.btn-csv-template').click(function() {

				window.location = 'include/template.csv';
			});
		},
	}

	if($('.campaign-form-content').length > 0) {

		campaignForm.init();
	}

	var campaign = {

		init:function() {
			
			campaign.selectCampaign();
			campaign.deleteCampaign();
			campaign.viewDetail();
		},

		selectCampaign: function() {

			$('.campaign-row').click(function() {

				$('.campaign-row').removeClass("active");

				$(this).addClass("active");
			});
		},

		deleteCampaign: function() {

			$('.btn-del-campagin').click(function() {

				var campaignTitle = $(this).parent().parent().find('.campaign-title').text();
				var campaignId = $(this).parent().parent().attr('id').replace(/campaign-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete ' + campaignTitle,
		            message: "Are you sure to Delete Campaign [<strong> " + campaignTitle + " </strong>] ?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    campaign.removeCampaign(campaignId);

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		removeCampaign: function(id) {

			var data = {

				campaign_id: id,
				active: '0',
			};

			$.ajax({

				url: 'ajax/removeCampaign.php',
				type: "POST",
				data: data,
				dataType: 'json',
                beforeSend: function(responses) {},
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Remove Campaign Success',
						            message: 'Remove Campaign Success!',
						            onhidden: function(dialogRef){

						                window.location.reload();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Remove Campaign Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {}
			});
		},

		viewDetail: function() {

			$('.campaign-row').dblclick(function() {

				var campaignId = this.id.replace(/campaign-/g, "");

				window.location = 'campaign.php?campaign_id=' + campaignId;
			});
		}
	}

	if($('.history-content').length > 0) {

		campaign.init();
	}

	var campaignDetail = {

		_currentItemCount: $("#item-count").val(),

		init: function() {

			campaignDetail.backToHistory();
			campaignDetail.deleteCampaign();
			campaignDetail.addNewItem();
			campaignDetail.getHtmlCode();
			campaignDetail.previewCampaign();
			campaignDetail.duplicateCampaign();

			$('#sent-date-picker input').datepicker({
				format: 'yyyy-mm-dd',
				todayBtn: true,
				todayHighlight: true,
    			// startDate: '0d',
			});

			// input submit
			$("#update-campaign-form").submit(function(e) {

		        e.preventDefault();
		        e.stopPropagation();

		        campaignDetail.updateCampaign();
		    });
		},

		backToHistory: function() {

			$('.btn-back-to-history').click(function() {

				window.location = 'history.php?company=' + $('#store-code').val();
			});
		},

		deleteCampaign: function() {

			$('.btn-del-campagin').click(function() {

				var campaignTitle = $('input[name=name]').val();
				var campaignId = $('input[name=campaign_id]').val();

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete ' + campaignTitle,
		            message: "Are you sure to Delete Campaign [<strong> " + campaignTitle + " </strong>] ?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    campaignDetail.removeCampaign(campaignId);

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		removeCampaign: function(id) {

			var data = {

				campaign_id: id,
				active: '0',
			};

			$.ajax({

				url: 'ajax/removeCampaign.php',
				type: "POST",
				data: data,
				dataType: 'json',
                beforeSend: function(responses) {},
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Remove Campaign Success',
						            message: 'Remove Campaign Success!',
						            onhidden: function(dialogRef){

						                window.location = 'history.php?company=' + $('#store-code').text();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Remove Campaign Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {}
			});
		},

		addNewItem: function() {

			var currentItemCount = campaignDetail._currentItemCount;

			$('.btn-add-new-item').click(function() {

				currentItemCount++;

				var symbol = $('#symbol').val();

				var html = '<div id="item-'+currentItemCount+'" class="added-item"><div class="item-number">Item '+currentItemCount+': <button type="button" class="btn btn-danger btn-del-item" id="del-item-'+currentItemCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Name*</label><div class="col-sm-4"><input type="text" name="item['+currentItemCount+'][name]" class="form-control" placeholder="Name" ></div><label class="col-sm-2 control-label">Description*</label><div class="col-sm-4"><input type="text" name="item['+currentItemCount+'][description]" class="form-control" placeholder="Description" ></div></div><div class="form-group"><label class="col-sm-2 control-label">URL*</label><div class="col-sm-10"><input type="text" name="item['+currentItemCount+'][url]" class="form-control" placeholder="URL" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Image URL*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="item['+currentItemCount+'][image_url]" class="form-control" placeholder="Image URL" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div><div class="form-group"><label class="col-sm-2 control-label">Button Image</label><div class="col-sm-10"><input type="text" name="item['+currentItemCount+'][button_image]" class="form-control" placeholder="Button Image"></div></div><div class="form-group"><div class="col-sm-6"><label class="col-sm-4 control-label">Orginal Price*</label><div class="input-group col-sm-8"><div class="input-group-addon">'+symbol+'</div><input type="number" step="0.01" name="item['+currentItemCount+'][orginal_price]" class="form-control" placeholder="Orginal Price" ></div></div><div class="col-sm-6"><label class="col-sm-4 control-label">Current Price*</label><div class="input-group col-sm-8"><div class="input-group-addon">'+symbol+'</div><input type="number" step="0.01" name="item['+currentItemCount+'][current_price]" class="form-control" placeholder="Current Price" ></div></div></div>';

				if($('#store-id').val() == '1') {

					html += '<div class="form-group"><label class="col-sm-2 control-label">Related Banner URL</label><div class="col-sm-10"><input type="text" name="item['+currentItemCount+'][related_banner_url]" class="form-control" placeholder="Related Banner URL"><span class="help-block">Only Support Some Templates.</span></div></div><div class="form-group"><label class="col-sm-2 control-label">Related Banner Image URL</label><div class="col-sm-10"><div class="input-group"><input type="text" name="item['+currentItemCount+'][related_banner_image_url]" class="form-control" placeholder="Related Banner Image URL"><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div><span class="help-block">Only Support Some Templates.</span></div></div><div class="form-group"><label class="col-sm-2 control-label">Related Banner Text</label><div class="col-sm-10"><input type="text" name="item['+currentItemCount+'][related_banner_text]" class="form-control" placeholder="Related Banner Text"><span class="help-block">Only Support Some Templates.</span></div></div>';
				}

				html += '</div>';

				$('.item-list').append(html);

				$('.btn-del-item').unbind('click');
				$('.btn-del-item').bind('click', campaignDetail.delItem());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delItem: function() {

			$('.btn-del-item').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-item-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Item' + itemId,
		            message: "Are you sure to Delete <strong>Item " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		updateCampaign: function() {

			$.ajax({

				url: 'ajax/updateCampaign.php',
				type: "POST",
				data: $("#update-campaign-form").serialize(),
				dataType: 'json',
                beforeSend: function(responses) {

                	common.ajaxLoader(true);
                },
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Update Campaign Success',
						            message: 'Update Campaign Success!',
						            onhidden: function(dialogRef){

						                window.location.reload();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Update Campaign Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {

					common.ajaxLoader(false);
				}
			});
		},

		getHtmlCode: function() {

			$('.btn-get-html').click(function() {

				common.getHtmlCode('update-campaign-form', 'template');
			});
		},

		previewCampaign: function() {

			$('.btn-preview-html').click(function() {

				common.previewHtml('update-campaign-form', 'template');
			});
		},

		duplicateCampaign: function() {

			$('.btn-duplicate-campagin').click(function() {

				BootstrapDialog.show({

					type: "type-warning",
					title: 'Try to Duplicate Campaign',
		            message: "Are you sure to Duplicate Campaign [<strong> " + $('input[name=name]').val() + " </strong>] ?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){

		                	// remove additional item 
		                	$(".item-list").find('.added-item').remove();
		                    
		                    $.ajax({

								url: 'ajax/createCampaign.php',
								type: "POST",
								data: $("#update-campaign-form").serialize(),
								dataType: 'json',
				                beforeSend: function(responses) {},
				                success: function(responses) {

				                	if(responses.success) {

				                		if(responses.data) {

				                			if(responses.data.data !== undefined) {

				                				//successs
					                			BootstrapDialog.show({
										            title: 'Duplicate Campaign Success',
										            message: 'Duplicate Campaign Success!',
										            onhidden: function(dialogRef){

										                window.location = 'campaign.php?campaign_id=' + responses.data.data.lastID;
										            }
										        });
					                		}
					                		else {

					                			//error
					                			BootstrapDialog.show({
					                				type: 'type-danger',
										            title: 'Duplicate Campaign Fail',
										            message: responses.data
										        });
					                		}
				                		}
				                	}
				                },
								error: function(responses) {

									BootstrapDialog.show({

										type: "type-danger",
										title: 'Error Message',
							            message: responses.responseText,
							        });
								},
								complete: function() {}
							});
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		}
	}

	if($('.history-detail-content').length > 0) {

		campaignDetail.init();
	}

	var message = {

		init: function() {

			message.selectMessage();
			message.addMessage();
			message.backToMessage();
			message.deleteMessage();
			message.viewDetail();
			message.duplicateMessage();

			// input submit
			$("#create-message-form").submit(function(e) {

		        e.preventDefault();
		        e.stopPropagation();

		        message.saveMessage();
		    });
		},

		selectMessage: function() {

			$('.message-row').click(function() {

				$('.message-row').removeClass("active");

				$(this).addClass("active");
			});
		},

		addMessage: function() {

			$('.btn-add-message').click(function() {

				$('.message-content').hide();
                $('.message-form-content').show();

               	// form init
               	message.clearForm();
			});
		},

		deleteMessage: function() {

			$('.btn-del-message').click(function() {

				if($('input[name=message_id]').val().length > 0) {

					var messageCode = $('input[name=code]').val();
					var messageId = $('input[name=message_id]').val();
				}
				else {

					var messageCode = $(this).parent().parent().find('.message-code').text();
					var messageId = $(this).parent().parent().attr('id').replace(/message-/g, "");
				}

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete ' + messageCode,
		            message: "Are you sure to Delete Message [<strong> " + messageCode + " </strong>] ?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    message.removeMessage(messageId);

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		removeMessage: function(id) {

			var data = {

				message_id: id,
				active: '0',
			};

			common.removeData('Message', 'saveMessage.php', data);
		},

		clearForm: function() {

			// reset form
			$('#create-message-form')[0].reset();

			$('input[name=message_id]').val("");
		},

		backToMessage: function() {

			$('.btn-back-to-message').click(function() {

				/*message.clearForm();

				// content
				$('.message-content').show();
		        $('.message-form-content').hide();*/

		        window.location.reload();
			});
		},

		saveMessage: function() {

			$.ajax({

				url: 'ajax/saveMessage.php',
				type: "POST",
				data: $("#create-message-form").serialize(),
				dataType: 'json',
                beforeSend: function(responses) {

                	common.ajaxLoader(true);
                },
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Save Message Success',
						            message: 'Save Message Success!',
						            onhidden: function(dialogRef){

						                window.location = 'translation.php?company=' + $('#company').val();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Save Message Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {

					common.ajaxLoader(false);
				}
			});
		},

		viewDetail: function() {

			$('.message-row').dblclick(function() {

				var messageId = this.id.replace(/message-/g, "");
				var messageCode = $(this).find('.message-code').text();
				var messageContent = $(this).find('.message-content').text();

				$('.message-content').hide();
                $('.message-form-content').show();

               	// form init
               	message.clearForm();

               	$('.edit-message-btn-group').show();

               	$('input[name=message_id]').val(messageId);
               	$('input[name=code]').val(messageCode);
               	$('input[name=content]').val(messageContent);
			});
		},

		duplicateMessage: function() {

			$('.btn-duplicate-message').click(function() {

				common.duplicateData('Message', $('input[name=code]').val(), 'saveMessage.php', $("#create-message-form :input[name!=message_id]").serialize(), 'translation.php?company=' + $('select[name=store_id] option:selected').text());
			});
		},
	}

	if($('.message-content').length > 0) {

		message.init();
	}

	var header = {

		_featureCount: 1,
		_menuCount: 1,

		init: function() {

			header.selectHeader();
			header.addHeader();
			header.backToHeader();
			header.deleteHeader();
			header.viewDetail();
			header.addNewFeature();
			header.addNewMenu();

			header.duplicateHeader();
			header.getHtmlCode();
			header.previewHeader();

			header.onFocusPreview();

			// input submit
			$("#create-header-form").submit(function(e) {

		        e.preventDefault();
		        e.stopPropagation();

		        header.saveHeader();
		    });
		},

		onFocusPreview: function() {

			//form
			$('.form-control').on('focus mouseover', function() {

				$('.preview-'+$(this).attr('name')).addClass('active');
			});

			$('.form-control').on('blur, mouseout', function() {

				$('.preview-'+$(this).attr('name')).removeClass('active');
			});

			//feature
			$('.feature-list').mouseover(function() {

				$('.preview-feature').addClass('active');
			});

			$('.feature-list').mouseout(function() {

				$('.preview-feature').removeClass('active');
			});

			//menu
			$('.menu-list').mouseover(function() {

				$('.preview-menu').addClass('active');
			});

			$('.menu-list').mouseout(function() {

				$('.preview-menu').removeClass('active');
			});

			/*// preview
			$('.preview-top_text').click(function() {

				$('input[name=top_text]').focus();
			});

			$('.preview-logo_image').click(function() {

				$('input[name=logo_image]').focus();
			});

			$('.preview-feature').click(function() {

				$('.feature-list').find('input[type=text]')[0].focus();
			});*/
		},

		selectHeader: function() {

			$('.header-row').click(function() {

				$('.header-row').removeClass("active");

				$(this).addClass("active");
			});
		},

		addHeader: function() {

			$('.btn-add-header').click(function() {

				$('.header-content').hide();
                $('.header-form-content').show();

               	// form init
               	header.clearForm();
			});
		},

		deleteHeader: function() {

			$('.btn-del-header').click(function() {

				if($('input[name=header_id]').val().length > 0) {

					var headerCode = $('input[name=code]').val();
					var headerId = $('input[name=header_id]').val();
				}
				else {

					var headerCode = $(this).parent().parent().find('.header-code').text();
					var headerId = $(this).parent().parent().attr('id').replace(/header-/g, "");
				}

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete ' + headerCode,
		            message: "Are you sure to Delete Header [<strong> " + headerCode + " </strong>] ?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    header.removeHeader(headerId);

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		removeHeader: function(id) {

			var data = {

				header_id: id,
				active: '0',
			};

			common.removeData('Header', 'saveHeader.php', data);
		},

		clearForm: function() {

			// reset form
			$('#create-header-form')[0].reset();

			$('input[name=header_id]').val("");
		},

		backToHeader: function() {

			$('.btn-back-to-header').click(function() {

				/*header.clearForm();

				// content
				$('.header-content').show();
		        $('.header-form-content').hide();*/

		        window.location.reload();
			});
		},

		saveHeader: function() {

			$.ajax({

				url: 'ajax/saveHeader.php',
				type: "POST",
				data: $("#create-header-form").serialize(),
				dataType: 'json',
                beforeSend: function(responses) {

                	common.ajaxLoader(true);
                },
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Save Header Success',
						            message: 'Save Header Success!',
						            onhidden: function(dialogRef){

						                window.location = 'createHeader.php?company=' + $('#company').val();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Save Header Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {

					common.ajaxLoader(false);
				}
			});
		},

		viewDetail: function() {

			$('.header-row').dblclick(function() {

				var headerId = this.id.replace(/header-/g, "");

				$('.header-content').hide();
                $('.header-form-content').show();

               	// form init
               	header.clearForm();

               	$('.edit-header-btn-group').show();

               	$('input[name=header_id]').val(headerId);

               	var data = {

               		header_id: headerId,
               		active: '1',
               	};

               	$.ajax({

					url: 'ajax/viewHeader.php',
					type: "POST",
					data: data,
					dataType: 'json',
	                beforeSend: function(responses) {},
	                success: function(responses) {

	                	if(responses.success) {

	                		if(responses.data) {

	                			if(responses.data.data !== undefined) {

	                				//successs
		                			$.each( responses.data.data[0], function( key, value ) {

										if(key == 'features' || key == 'menus') {

											$('.'+key.slice(0, -1)+'-list').html('');

											for (var i = 1; i <= value.length; i++) {

												var html = '';

												switch(key) {

													case 'features':

														html += '<div id="feature-'+i+'"><div class="feature-number">Feature '+i+':</div><input type="hidden" name="feature['+i+'][header_feature_id]" value="'+value[i-1].header_feature_id+'" class="form-control" placeholder="Text" ><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="feature['+i+'][text]" value="'+value[i-1].text+'" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url</label><div class="col-sm-10"><input type="text" name="feature['+i+'][url]" value="'+value[i-1].url+'" class="form-control" placeholder="Url"></div></div><div class="form-group"><label class="col-sm-2 control-label">Image*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="feature['+i+'][image_url]" value="'+value[i-1].image_url+'" class="form-control" placeholder="Image" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div>';

														$('.feature-list').append(html);

														header._featureCount = value.length;

													break;

													case 'menus':

														html += '<div id="menu-'+i+'"><div class="menu-number">Navigation '+i+':</div><input type="hidden" name="menu['+i+'][header_navigation_id]" value="'+value[i-1].header_navigation_id+'" class="form-control" placeholder="Text" ><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="menu['+i+'][text]" value="'+value[i-1].text+'" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url*</label><div class="col-sm-10"><input type="text" name="menu['+i+'][url]" value="'+value[i-1].url+'" class="form-control" placeholder="Url"></div></div></div>';

														$('.menu-list').append(html);

														header._menuCount = value.length;

													break;
												}

												$('.btn-preview-image').unbind('click');
												$('.btn-preview-image').bind('click', button.previewImage());

											};
										}
										else {

											$('input[name='+key+']').val(value);
										}
									});
		                		}
		                		else {

		                			//error
		                			BootstrapDialog.show({
		                				type: 'type-danger',
							            title: 'View Header Fail',
							            message: responses.data
							        });
		                		}
	                		}
	                	}
	                },
					error: function(responses) {

						BootstrapDialog.show({

							type: "type-danger",
							title: 'Error Message',
				            message: responses.responseText,
				        });
					},
					complete: function() {}
				});
			});
		},

		addNewFeature: function() {

			$('.btn-add-new-feature').click(function() {

				header._featureCount++;

				var html = '<div id="feature-'+header._featureCount+'" class="added-feature"><div class="feature-number">Feature '+header._featureCount+': <button type="button" class="btn btn-danger btn-del-feature" id="del-feature-'+header._featureCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="feature['+header._featureCount+'][text]" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url</label><div class="col-sm-10"><input type="text" name="feature['+header._featureCount+'][url]" class="form-control" placeholder="Url"></div></div><div class="form-group"><label class="col-sm-2 control-label">Image*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="feature['+header._featureCount+'][image_url]" class="form-control" placeholder="Image" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div></div>';

				$('.feature-list').append(html);

				$('.btn-del-feature').unbind('click');
				$('.btn-del-feature').bind('click', header.delFeature());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delFeature: function() {

			$('.btn-del-feature').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-feature-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Feature' + itemId,
		            message: "Are you sure to Delete <strong>Feature " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		addNewMenu: function() {

			$('.btn-add-new-menu').click(function() {

				header._menuCount++;

				var html = '<div id="menu-'+header._menuCount+'"><div class="menu-number">Navigation '+header._menuCount+': <button type="button" class="btn btn-danger btn-del-menu" id="del-menu-'+header._menuCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="menu['+header._menuCount+'][text]" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url*</label><div class="col-sm-10"><input type="text" name="menu['+header._menuCount+'][url]" class="form-control" placeholder="Url" ></div></div></div>';

				$('.menu-list').append(html);

				$('.btn-del-menu').unbind('click');
				$('.btn-del-menu').bind('click', header.delMenu());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delMenu: function() {

			$('.btn-del-menu').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-menu-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Menu' + itemId,
		            message: "Are you sure to Delete <strong>Menu " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		duplicateHeader: function() {

			$('.btn-duplicate-header').click(function() {

				common.duplicateData('Header', $('input[name=code]').val(), 'saveHeader.php', $("#create-header-form :input[name!=header_id]").serialize(), 'createHeader.php?company=' + $('#company').val());
			});
		},

		getHtmlCode: function() {

			$('.btn-get-html').click(function() {

				common.getHtmlCode('create-header-form', 'header');
			});
		},

		previewHeader: function() {

			$('.btn-preview-html').click(function() {

				common.previewHtml('create-header-form', 'header');
			});
		},
	}

	if($('.header-content').length > 0) {

		header.init();
	}

	var footer = {

		_bannerCount: 1,
		_menuCount: 2,
		_socialCount: 1,

		init: function() {

			footer.selectFooter();
			footer.addFooter();
			footer.backToFooter();
			footer.deleteFooter();
			footer.viewDetail();
			footer.addNewBanner();
			footer.addNewMenu();
			footer.addNewSocial();

			footer.duplicateFooter();
			footer.getHtmlCode();
			footer.previewFooter();

			footer.onFocusPreview();

			// input submit
			$("#create-footer-form").submit(function(e) {

		        e.preventDefault();
		        e.stopPropagation();

		        footer.saveFooter();
		    });
		},

		onFocusPreview: function() {

			//form
			$('.form-control').on('focus mouseover', function() {

				$('.preview-'+$(this).attr('name')).addClass('active');
			});

			$('.form-control').on('blur, mouseout', function() {

				$('.preview-'+$(this).attr('name')).removeClass('active');
			});

			//banner
			$('.banner-list').mouseover(function() {

				$('.preview-banner').addClass('active');
			});

			$('.banner-list').mouseout(function() {

				$('.preview-banner').removeClass('active');
			});

			//menu
			$('.menu-list').mouseover(function() {

				$('.preview-menu').addClass('active');
			});

			$('.menu-list').mouseout(function() {

				$('.preview-menu').removeClass('active');
			});

			//social
			$('.social-list').mouseover(function() {

				$('.preview-social').addClass('active');
			});

			$('.social-list').mouseout(function() {

				$('.preview-social').removeClass('active');
			});
		},

		selectFooter: function() {

			$('.footer-row').click(function() {

				$('.footer-row').removeClass("active");

				$(this).addClass("active");
			});
		},

		addFooter: function() {

			$('.btn-add-footer').click(function() {

				$('.footer-content').hide();
                $('.footer-form-content').show();

               	// form init
               	footer.clearForm();
			});
		},

		deleteFooter: function() {

			$('.btn-del-footer').click(function() {

				if($('input[name=footer_id]').val().length > 0) {

					var footerCode = $('input[name=code]').val();
					var footerId = $('input[name=footer_id]').val();
				}
				else {

					var footerCode = $(this).parent().parent().find('.footer-code').text();
					var footerId = $(this).parent().parent().attr('id').replace(/footer-/g, "");
				}

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete ' + footerCode,
		            message: "Are you sure to Delete Footer [<strong> " + footerCode + " </strong>] ?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    footer.removeFooter(footerId);

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		removeFooter: function(id) {

			var data = {

				footer_id: id,
				active: '0',
			};

			common.removeData('Footer', 'saveFooter.php', data);
		},

		clearForm: function() {

			// reset form
			$('#create-footer-form')[0].reset();

			$('input[name=footer_id]').val("");
		},

		backToFooter: function() {

			$('.btn-back-to-footer').click(function() {

				/*footer.clearForm();

				// content
				$('.footer-content').show();
		        $('.footer-form-content').hide();*/

		        window.location.reload();
			});
		},

		saveFooter: function() {

			$.ajax({

				url: 'ajax/saveFooter.php',
				type: "POST",
				data: $("#create-footer-form").serialize(),
				dataType: 'json',
                beforeSend: function(responses) {

                	common.ajaxLoader(true);
                },
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Save Footer Success',
						            message: 'Save Footer Success!',
						            onhidden: function(dialogRef){

						                window.location = 'createFooter.php?company=' + $('#company').val();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Save Footer Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {

					common.ajaxLoader(false);
				}
			});
		},

		viewDetail: function() {

			$('.footer-row').dblclick(function() {

				var footerId = this.id.replace(/footer-/g, "");

				$('.footer-content').hide();
                $('.footer-form-content').show();

               	// form init
               	footer.clearForm();

               	$('.edit-footer-btn-group').show();

               	$('input[name=footer_id]').val(footerId);

               	var data = {

               		footer_id: footerId,
               		active: '1',
               	};

               	$.ajax({

					url: 'ajax/viewFooter.php',
					type: "POST",
					data: data,
					dataType: 'json',
	                beforeSend: function(responses) {},
	                success: function(responses) {

	                	if(responses.success) {

	                		if(responses.data) {

	                			if(responses.data.data !== undefined) {

	                				//successs
		                			$.each( responses.data.data[0], function( key, value ) {

										if(key == 'banners' || key == 'menus' || key == 'socials') {

											$('.'+key.slice(0, -1)+'-list').html('');

											for (var i = 1; i <= value.length; i++) {

												var html = '';

												switch(key) {

													case 'banners':

														html += '<div id="banner-'+i+'"><div class="banner-number">Banner '+i+':</div><input type="hidden" name="banner['+i+'][footer_banner_id]" value="'+value[i-1].footer_banner_id+'" class="form-control" placeholder="Text" ><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="banner['+i+'][text]" value="'+value[i-1].text+'" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url*</label><div class="col-sm-10"><input type="text" name="banner['+i+'][url]" value="'+value[i-1].url+'" class="form-control" placeholder="Url" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Image*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="banner['+i+'][image_url]" value="'+value[i-1].image_url+'" class="form-control" placeholder="Image" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div></div>';

														$('.banner-list').append(html);

														footer._bannerCount = value.length;

													break;

													case 'menus':

														html += '<div id="menu-'+i+'"><div class="menu-number">Navigation '+i+':</div><input type="hidden" name="menu['+i+'][footer_navigation_id]" value="'+value[i-1].footer_navigation_id+'" class="form-control" placeholder="Text" ><div class="form-group"><label class="col-sm-2 control-label">Text</label><div class="col-sm-10"><input type="text" name="menu['+i+'][text]" value="'+value[i-1].text+'" class="form-control" placeholder="Text"></div></div><div class="form-group"><label class="col-sm-2 control-label">Url</label><div class="col-sm-10"><input type="text" name="menu['+i+'][url]" value="'+value[i-1].url+'" class="form-control" placeholder="Url"></div></div></div>';

														$('.menu-list').append(html);

														footer._menuCount = value.length;

													break;

													case 'socials':

														html += '<div id="social-'+i+'"><div class="social-number">Social '+i+':</div><input type="hidden" name="social['+i+'][footer_social_id]" value="'+value[i-1].footer_social_id+'" class="form-control" placeholder="Text" ><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="social['+i+'][text]" value="'+value[i-1].text+'" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url*</label><div class="col-sm-10"><input type="text" name="social['+i+'][url]" value="'+value[i-1].url+'" class="form-control" placeholder="Url" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Image*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="social['+i+'][image_url]" value="'+value[i-1].image_url+'" class="form-control" placeholder="Image" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div></div>';

														$('.social-list').append(html);

														footer._socialCount = value.length;

													break;
												}

												$('.btn-preview-image').unbind('click');
												$('.btn-preview-image').bind('click', button.previewImage());

											};
										}
										else if (key == 'copyright') {

											$('textarea[name='+key+']').val(value);
										}
										else {

											$('input[name='+key+']').val(value);
										}
									});
		                		}
		                		else {

		                			//error
		                			BootstrapDialog.show({
		                				type: 'type-danger',
							            title: 'View Footer Fail',
							            message: responses.data
							        });
		                		}
	                		}
	                	}
	                },
					error: function(responses) {

						BootstrapDialog.show({

							type: "type-danger",
							title: 'Error Message',
				            message: responses.responseText,
				        });
					},
					complete: function() {}
				});
			});
		},

		addNewBanner: function() {

			$('.btn-add-new-banner').click(function() {

				footer._bannerCount++;

				var html = '<div id="banner-'+footer._bannerCount+'"><div class="banner-number">Banner '+footer._bannerCount+': <button type="button" class="btn btn-danger btn-del-banner" id="del-banner-'+footer._bannerCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Text</label><div class="col-sm-10"><input type="text" name="banner['+footer._bannerCount+'][text]" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url</label><div class="col-sm-10"><input type="text" name="banner['+footer._bannerCount+'][url]" class="form-control" placeholder="Url" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Image</label><div class="col-sm-10"><div class="input-group"><input type="text" name="banner['+footer._bannerCount+'][image_url]" class="form-control" placeholder="Image" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div></div>';

				$('.banner-list').append(html);

				$('.btn-del-banner').unbind('click');
				$('.btn-del-banner').bind('click', footer.delBanner());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delBanner: function() {

			$('.btn-del-banner').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-banner-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Banner' + itemId,
		            message: "Are you sure to Delete <strong>Banner " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		addNewMenu: function() {

			$('.btn-add-new-menu').click(function() {

				footer._menuCount++;

				var html = '<div id="menu-'+footer._menuCount+'"><div class="menu-number">Navigation '+footer._menuCount+': <button type="button" class="btn btn-danger btn-del-menu" id="del-menu-'+footer._menuCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="menu['+footer._menuCount+'][text]" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url*</label><div class="col-sm-10"><input type="text" name="menu['+footer._menuCount+'][url]" class="form-control" placeholder="Url" ></div></div></div>';

				$('.menu-list').append(html);

				$('.btn-del-menu').unbind('click');
				$('.btn-del-menu').bind('click', footer.delMenu());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delMenu: function() {

			$('.btn-del-menu').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-menu-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Menu' + itemId,
		            message: "Are you sure to Delete <strong>Menu " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		addNewSocial: function() {

			$('.btn-add-new-social').click(function() {

				footer._socialCount++;

				var html = '<div id="social-'+footer._socialCount+'"><div class="social-number">Social '+footer._socialCount+': <button type="button" class="btn btn-danger btn-del-social" id="del-social-'+footer._socialCount+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div><div class="form-group"><label class="col-sm-2 control-label">Text*</label><div class="col-sm-10"><input type="text" name="social['+footer._socialCount+'][text]" class="form-control" placeholder="Text" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Url*</label><div class="col-sm-10"><input type="text" name="social['+footer._socialCount+'][url]" class="form-control" placeholder="Url" ></div></div><div class="form-group"><label class="col-sm-2 control-label">Image*</label><div class="col-sm-10"><div class="input-group"><input type="text" name="social['+footer._socialCount+'][image_url]" class="form-control" placeholder="Image" ><span class="input-group-btn"><button class="btn btn-default btn-preview-image" type="button"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> Preview</button></span></div></div></div></div>';

				$('.social-list').append(html);

				$('.btn-del-social').unbind('click');
				$('.btn-del-social').bind('click', footer.delSocial());

				$('.btn-preview-image').unbind('click');
				$('.btn-preview-image').bind('click', button.previewImage());
			});
		},

		delSocial: function() {

			$('.btn-del-social').click(function() {

				var item = $(this);
				var itemId = this.id.replace(/del-social-/g, "");

				BootstrapDialog.show({

					type: "type-danger",
					title: 'Try to Delete Social' + itemId,
		            message: "Are you sure to Delete <strong>Social " + itemId + " </strong>?",
		            buttons: [ 
		            {
		                label: 'Yes',
		                // no title as it is optional
		                cssClass: 'btn-primary',
		                action: function(dialogItself){
		                    
		                    item.parent().parent().remove();

		                    // close dialog
		                    dialogItself.close();
		                }
		            }, 
		            {
		                label: 'Close',
		                action: function(dialogItself){
		                    dialogItself.close();
		                }
		            }]
		        });
			});
		},

		duplicateFooter: function() {

			$('.btn-duplicate-footer').click(function() {

				common.duplicateData('Footer', $('input[name=code]').val(), 'saveFooter.php', $("#create-footer-form :input[name!=footer_id]").serialize(), 'createFooter.php?company=' + $('#company').val());
			});
		},

		getHtmlCode: function() {

			$('.btn-get-html').click(function() {

				common.getHtmlCode('create-footer-form', 'footer');
			});
		},

		previewFooter: function() {

			$('.btn-preview-html').click(function() {

				common.previewHtml('create-footer-form', 'footer');
			});
		},
	}

	if($('.footer-content').length > 0) {

		footer.init();
	}

	var button = {

		init: function() {

			button.goToTop();
			button.scrollFunction();
			button.previewImage();

			button.sendEmail();

			$('.go-top-button').hide();

			$('#change-company').on('change', function() {

				var urlCode = $(this).val();

				if(window.location.pathname == '/campaign.php') {

					window.location = window.location.protocol + "//" + window.location.hostname + "" + "/history.php" + "?company=" + urlCode;
				}
				else {

					window.location = window.location.protocol + "//" + window.location.hostname + "" + window.location.pathname + "?company=" + urlCode;
				}
			});

			if(window.location.search == '?company=') {

				$('.btn-add-campaign, .btn-add-message, .btn-add-header, .btn-add-footer').hide();
			}

			button.sortColumn();
		},

		goToTop: function () {

			$('.go-top-button').click(function() {

				$("body,html").animate({ scrollTop: 0 }, "fast");
	  			return false;
			});
		},

		scrollFunction:function () {

			$(window).scroll(function (event) {

				var offset = $(window).scrollTop();

				// table header fix

				// go to top btn
			    if(offset === 0) {

			    	$('.go-top-button').hide();
			    }
			    else {

					$('.go-top-button').show();
				}

				// preview header/footer
				if(offset > 163) {

					$('.preview-form').addClass("fix-preview");
				}
				else {

					$('.preview-form').removeClass("fix-preview");
				}
			});
		},

		previewImage: function() {

			$('.btn-preview-image').click(function() {

				var url = $(this).parent().parent().find('input[type=text]').val();

				if(url.length > 0) {

					BootstrapDialog.show({

						title: 'Preview Image',
			            message: "<img src='"+ url +"' border='0'>",
			            buttons: [ 
			            {
			                label: 'Close',
			                action: function(dialogItself){
			                    dialogItself.close();
			                }
			            }]
			        });
				}
			});
		},

		sendEmail: function() {

			$('.btn-send-email').click(function() {

				if($('input[name=email-list]').val().length > 0) {

					$.ajax({

						url: 'ajax/template.php',
						type: "POST",
						data: $("#update-campaign-form").serialize(),
						dataType: 'json',
		                beforeSend: function(responses) {},
		                success: function(responses) {

		                	if(responses.success) {

		                		if(responses.mail) {

			                		//successs
		                			BootstrapDialog.show({
							            title: 'Send Email Success',
							            message: 'Send Email Success!',
							        });
			                	}
		                	}
		                },
						error: function(responses) {

							BootstrapDialog.show({

								type: "type-danger",
								title: 'Error Message',
					            message: responses.responseText,
					        });
						},
						complete: function() {}
					});
				}
			});
		},

		sortColumn: function() {

			//init set icon
			$('.grid').find('.table').find('th').each(function() {

				if(typeof($(this).attr("class")) === "undefined") {

				}
				else {

					switch($(this).attr("class")) {

						case 'sort-by-desc':
							// change icon
							$(this).append('<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>');
							break;

						case 'sort-by-asc':
							// change icon
							$(this).append('<span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span>');
							break;
					}
				}
			});

			//click to sort
			$('.grid').find('.table').find('th').click(function() {

				if(typeof($(this).attr("data")) !== "undefined") {

					// dun have any class
					if(typeof($(this).attr("class")) === "undefined") {
						
						$(this).addClass('sort-by-desc');

						$(this).parent().find('.glyphicon').remove();
						$(this).append('<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>');
					}
					else {

						switch($(this).attr("class")) {

							case 'sort-by-desc':
								// remove all class, other column
								$(this).removeAttr('class');
								$(this).parent().find('th').removeAttr('class');
								$(this).parent().find('.glyphicon').remove();

								// change class
								$(this).addClass('sort-by-asc');

								// change icon
								$(this).find('.glyphicon').remove();
								$(this).append('<span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span>');
								break;

							case 'sort-by-asc':
								// remove all class, other column
								$(this).removeAttr('class');
								$(this).parent().find('th').removeAttr('class');
								$(this).parent().find('.glyphicon').remove();

								// change class
								$(this).addClass('sort-by-desc');

								// change icon
								$(this).find('.glyphicon').remove();
								$(this).append('<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>');
								break;

							default :
								$(this).addClass('sort-by-desc');

								$(this).parent().find('.glyphicon').remove();
								$(this).append('<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>');
								break;
						}
					}

					// get data again
					var sortBy = $(this).attr('class').replace(/sort-by-/g, "").toUpperCase();
					var orderBy = $(this).attr('data');
					var urlCode = $('#change-company').val();

					window.location = window.location.protocol + "//" + window.location.hostname + "" + window.location.pathname + "?company=" + urlCode + "&sort_by=" + sortBy + "&order_by=" + orderBy;
				}
			});
		},
	}

	button.init();

	var common = {

		ajaxLoader: function(showLoader) {

			if(showLoader) {

				$('.ajax-loader').show();
				$('button[type=submit]').hide();
			}
			else {

				$('.ajax-loader').hide();
				$('button[type=submit]').show();
			}
		},

		getHtmlCode: function(form, file) {

			$.ajax({

				url: 'ajax/'+file+'.php',
				type: "POST",
				data: $("#"+form+"").serialize(),
				dataType: 'json',
                beforeSend: function(responses) {},
                success: function(responses) {

                	if(responses.success) {

                		if(responses.html) {

                			// replace tab, new line, <, >, &
                			var html = responses.html.replace(/\t/g, "").replace(/(?:\r\n|\r|\n)/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                			var meta = responses.meta.replace(/\t/g, "").replace(/(?:\r\n|\r|\n)/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                			var css = responses.css.replace(/\t/g, "").replace(/(?:\r\n|\r|\n)/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

                			BootstrapDialog.show({

					            title: 'Html Code',
					            message: '<textarea readonly class="html-code form-control" rows="16">' + meta + css + html + '</textarea>',
					            buttons: [ 
					            {
					                label: '<span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span> Copy',
					                // no title as it is optional
					                cssClass: 'btn-primary',
					                action: function(dialogItself){

					                	$('.html-code').select();
					                    
					                    // Use try & catch for unsupported browser
										try {

											// The important part (copy selected text)
											var successful = document.execCommand('copy');

										} 
										catch (err) {

											alert("Unsupported Browser!");
										}
					                }
					            },
					            {
					                label: 'Close',
					                action: function(dialogItself){
					                    dialogItself.close();
					                }
					            }]
					        });
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {}
			});
		},

		previewHtml: function(form, file) {

			BootstrapDialog.show({

	            title: 'Preview',
	            message: '<iframe id="preview-iframe" style="background-color:#fff; width: 100%; min-height: '+$(window).height()*0.7 +'px; border: none;">Loading...</iframe>',
	            onshown: function(dialogRef) {

	            	var $frame = $('#preview-iframe');

					$.ajax({

						url: 'ajax/'+file+'.php',
						type: "POST",
						data: $("#"+form+"").serialize(),
						dataType: 'json',
		                beforeSend: function(responses) {},
		                success: function(responses) {

		                	if(responses.success) {

		                		if(responses.html) {

								    setTimeout( function() {
							            var doc = $frame[0].contentWindow.document;
							            var $body = $('body',doc);
							            $body.html(responses.meta + responses.css + responses.html);
								    }, 1 );
		                		}
		                	}
		                },
						error: function(responses) {

							BootstrapDialog.show({

								type: "type-danger",
								title: 'Error Message',
					            message: responses.responseText,
					        });
						},
						complete: function() {}
					});
	            },
	            buttons: [ 
	            {
	                label: 'Close',
	                action: function(dialogItself){
	                    dialogItself.close();
	                }
	            }]
	        });
		},

		duplicateData: function(controller, code, ajaxUrl, ajaxData, callback) {

			BootstrapDialog.show({

				type: "type-warning",
				title: 'Try to Duplicate '+ controller,
	            message: "Are you sure to Duplicate "+ controller +" [<strong> " + code + " </strong>] ?",
	            buttons: [ 
	            {
	                label: 'Yes',
	                // no title as it is optional
	                cssClass: 'btn-primary',
	                action: function(dialogItself){

	                	var oldCode = ajaxData.split('code=').pop().split('&').shift();;

	                	ajaxData = ajaxData.replace(oldCode, oldCode + '(Clone)');

	                    $.ajax({

							url: 'ajax/'+ajaxUrl,
							type: "POST",
							data: ajaxData,
							dataType: 'json',
			                beforeSend: function(responses) {},
			                success: function(responses) {

			                	if(responses.success) {

			                		if(responses.data) {

			                			if(responses.data.data !== undefined) {

			                				//successs
				                			BootstrapDialog.show({
									            title: 'Duplicate '+controller+' Success',
									            message: 'Duplicate '+controller+' Success!',
									            onhidden: function(dialogRef){

									                window.location = callback;
									            }
									        });
				                		}
				                		else {

				                			//error
				                			BootstrapDialog.show({
				                				type: 'type-danger',
									            title: 'Duplicate '+controller+' Fail',
									            message: responses.data
									        });
				                		}
			                		}
			                	}
			                },
							error: function(responses) {

								BootstrapDialog.show({

									type: "type-danger",
									title: 'Error Message',
						            message: responses.responseText,
						        });
							},
							complete: function() {}
						});
	                }
	            }, 
	            {
	                label: 'Close',
	                action: function(dialogItself){
	                    dialogItself.close();
	                }
	            }]
	        });
		},

		removeData: function(controller, ajaxUrl, ajaxData) {

			$.ajax({

				url: 'ajax/'+ajaxUrl,
				type: "POST",
				data: ajaxData,
				dataType: 'json',
                beforeSend: function(responses) {},
                success: function(responses) {

                	if(responses.success) {

                		if(responses.data) {

                			if(responses.data.data !== undefined) {

                				//successs
	                			BootstrapDialog.show({
						            title: 'Remove '+controller+' Success',
						            message: 'Remove '+controller+' Success!',
						            onhidden: function(dialogRef){

						                window.location.reload();
						            }
						        });
	                		}
	                		else {

	                			//error
	                			BootstrapDialog.show({
	                				type: 'type-danger',
						            title: 'Remove '+controller+' Fail',
						            message: responses.data
						        });
	                		}
                		}
                	}
                },
				error: function(responses) {

					BootstrapDialog.show({

						type: "type-danger",
						title: 'Error Message',
			            message: responses.responseText,
			        });
				},
				complete: function() {}
			});
		},
	}

})(jQuery);