/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CustomRangeType, Disposable, Inject, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import { DocCustomRangeService } from '@univerjs/docs';
import { DocMentionModel } from '../models/doc-mention.model';

@OnLifecycle(LifecycleStages.Ready, DocMentionCustomRangeController)
export class DocMentionCustomRangeController extends Disposable {
    constructor(
        @Inject(DocCustomRangeService) private readonly _docCustomRangeService: DocCustomRangeService,
        @Inject(DocMentionModel) private readonly _docMentionModel: DocMentionModel
    ) {
        super();

        this._initCustomRangeHooks();
    }

    private _initCustomRangeHooks() {
        this.disposeWithMe(
            this._docCustomRangeService.addClipboardHook({
                onCopyCustomRange: (unitId, range) => {
                    const { rangeId, rangeType, data, ...ext } = range;
                    if (rangeType === CustomRangeType.MENTION) {
                        if (data) {
                            const id = Tools.generateRandomId();
                            this._docMentionModel.addMention(unitId, {
                                id,
                                ...JSON.parse(data),
                            });
                            return {
                                ...range,
                                rangeId: id,
                            };
                        }
                        const link = this._docMentionModel.copyMention(unitId, rangeId);
                        if (!link) {
                            return range;
                        }

                        return {
                            ...ext,
                            rangeId: link.id,
                            rangeType,
                        };
                    }
                    return range;
                },
            })
        );
    }
}
